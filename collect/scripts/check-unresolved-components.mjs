#!/usr/bin/env node
/**
 * 扫描「模板里用了、但可能解析不到」的组件
 *
 * 背景：unplugin-vue-components 只扫描 src/components（vite.config.ts 默认 dirs）。
 * src/pages/** 下的子组件若既没显式 import、又不在扫描目录，模板标签会被静默丢弃，
 * 页面渲染为空，只在控制台留一条 Failed to resolve component 警告 —— 构建不报错。
 *
 * 注意文件名 ≠ 模板标签名的情况：src/pages/components/input-filter/if-text-filter.vue
 * 在模板里写作 <if-text-input-filter />（组件名 IfTextInputFilter）。
 * 所以索引同时按「文件名」和「defineOptions.name」两条建立。
 *
 * 输出两类：
 *   A 类（确定要修）磁盘存在对应组件，但当前文件没 import —— 页面必然渲染为空
 *   B 类（需人工确认）磁盘找不到，且不是 el-* / 内置标签 —— 可能是第三方组件或拼写错误
 *
 * 用法：node ./scripts/check-unresolved-components.mjs
 *      node ./scripts/check-unresolved-components.mjs --strict   # B 类也算失败
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const strict = process.argv.includes('--strict');
const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

/** 内置标签；命中直接跳过 */
const IGNORE_TAGS = new Set([
  'template', 'slot', 'component', 'transition', 'transition-group', 'keep-alive',
  'teleport', 'suspense', 'router-view', 'router-link', 'svg', 'path', 'g', 'circle',
  'rect', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'lineargradient',
  'radialgradient', 'clippath', 'use', 'filter', 'fegaussianblur', 'foreignobject',
  'canvas', 'video', 'audio', 'source', 'img', 'input', 'button', 'span', 'div', 'p',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'pre', 'code', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe', 'label', 'form', 'select',
  'option', 'textarea', 'strong', 'em', 'b', 'i', 'u', 'small', 'header', 'footer',
  'main', 'section', 'nav', 'aside', 'article', 'figure', 'figcaption', 'blockquote',
  'col', 'colgroup', 'caption', 'fieldset', 'legend', 'dl', 'dt', 'dd', 'mark', 'time',
]);

/** 第三方组件前缀：由各自的 resolver / 插件处理，不在本脚本判定范围 */
const THIRD_PARTY_PREFIX = [/^a-/, /^v-/, /^g6-/, /^x-/, /^van-/, /^n-/, /^ant-/];

const toPascal = (tag) =>
  tag
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith('.vue') ? [full] : [];
});

const allVue = walk(srcDir);

/** 索引：组件名(Pascal) -> 文件路径数组。同时收录文件名与 defineOptions.name */
const index = new Map();
const addIndex = (key, file) => {
  if (!key) return;
  if (!index.has(key)) index.set(key, []);
  if (!index.get(key).includes(file)) index.get(key).push(file);
};

for (const file of allVue) {
  addIndex(toPascal(basename(file, '.vue')), file);
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(/defineOptions\(\s*\{[^}]*?name:\s*['"]([\w-]+)['"]/g)) {
    addIndex(toPascal(m[1]), file);
  }
}

/** components.d.ts 中已自动注册的组件名（来自 src/components 扫描） */
const registered = new Set();
const dtsPath = resolve(srcDir, 'components.d.ts');
if (existsSync(dtsPath)) {
  for (const m of readFileSync(dtsPath, 'utf8').matchAll(/^\s+([A-Z]\w+):/gm)) {
    registered.add(m[1]);
  }
}

const rel = (p) => p.replace(srcDir + '\\', '').replace(srcDir + '/', '');
const missing = []; // A 类
const unknown = []; // B 类

for (const file of allVue) {
  const code = readFileSync(file, 'utf8');
  const tplMatch = code.match(/<template>([\s\S]*)<\/template>/);
  if (!tplMatch) continue;
  const tpl = tplMatch[1];

  /* 模板可用标识符 = import 进来的 + 本文件内定义的
   * 先剥注释：被注释掉的 import 不生效，不能让脚本误判为已导入 */
  const noComment = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  const imported = new Set();

  /* 三种 import 形态：
   *   import Foo from 'x'
   *   import { Foo, Bar as Baz } from 'x'
   *   import Foo, { Bar } from 'x'        <- 混合，必须单独覆盖 */
  for (const m of noComment.matchAll(/^[ \t]*import\s+([^'"]+?)\s+from\s*['"]/gm)) {
    const clause = m[1].trim();
    const def = clause.match(/^([A-Za-z_$][\w$]*)/);
    if (def) imported.add(def[1]);
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      named[1].split(',').forEach((part) => {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) imported.add(name);
      });
    }
  }

  /* 本文件内定义的局部组件：const Foo = defineComponent(...) / markRaw(...) */
  for (const m of noComment.matchAll(/^[ \t]*const\s+([A-Z]\w*)\s*=/gm)) {
    imported.add(m[1]);
  }

  /* 只取 kebab-case 开标签，避免与属性名混淆 */
  const tags = new Set();
  for (const m of tpl.matchAll(/<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/g)) tags.add(m[1]);

  for (const tag of tags) {
    if (IGNORE_TAGS.has(tag)) continue;
    if (tag.startsWith('el-')) continue;
    if (THIRD_PARTY_PREFIX.some((re) => re.test(tag))) continue;

    const pascal = toPascal(tag);
    if (imported.has(pascal) || registered.has(pascal)) continue;

    const hits = (index.get(pascal) ?? []).filter((p) => p !== file);
    if (hits.length > 0) {
      missing.push({ file: rel(file), tag, hits: hits.map(rel) });
    } else {
      unknown.push({ file: rel(file), tag });
    }
  }
}

let failed = false;

if (missing.length > 0) {
  failed = true;
  console.log(`\n[A 类] 磁盘存在组件、但未 import —— 页面该区域会渲染为空（${missing.length} 处）\n`);
  for (const p of missing) {
    console.log(`  ${p.file}`);
    console.log(`    标签 <${p.tag}>  ->  ${p.hits.join(' | ')}`);
    console.log(`    改法：在 <script setup> 中显式 import\n`);
  }
}

if (unknown.length > 0) {
  console.log(`\n[B 类] 磁盘找不到对应组件，需人工确认是第三方还是拼写错误（${unknown.length} 处）\n`);
  const grouped = new Map();
  for (const p of unknown) {
    if (!grouped.has(p.tag)) grouped.set(p.tag, []);
    grouped.get(p.tag).push(p.file);
  }
  for (const [tag, files] of [...grouped].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  <${tag}>  ${files.length} 处  例：${files[0]}`);
  }
  console.log('');
  if (strict) failed = true;
}

if (failed) {
  console.log('结论：存在 A 类问题，必须修（或 B 类在 --strict 下被计入）');
} else if (unknown.length > 0) {
  console.log('结论：A 类 0 处；仅 B 类待人工确认，不阻断（加 --strict 可让 B 类也算失败）');
} else {
  console.log('OK：模板组件全部可解析');
}
process.exit(failed ? 1 : 0);
