#!/usr/bin/env node
/**
 * 将业务文件中 `from 'echarts'`（主包全量）改写为：
 *  - 值（init / format / graphic / use） -> import { ... } from '@/config/echarts/setup'
 *  - 类型                              -> import type { ... } from 'echarts'（type-only，运行时擦除，不拉主包）
 *  - import * as X from 'echarts'      -> import X from '@/config/echarts/setup'（default）
 *
 * 设计要点（吸取前两次教训）：
 *  - 逐行处理，绝不跨行匹配，避免吞并相邻 import 语句。
 *  - 只处理含 `from 'echarts'`（精确主包）的行；'echarts/core' 等子路径不动。
 *  - 跨行 import（如 multi-line-chart.vue）不在此处理，由人工 Edit 加 `import type`。
 *  - 排除 capability-profiles.ts（'echarts' 是文档示例字符串）与 setup.ts 自身。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const VALUE_IDENTS = new Set(['init', 'format', 'graphic', 'use']);

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(vue|ts|tsx|js)$/.test(name)) acc.push(p);
  }
  return acc;
}

function rewriteLine(line) {
  // import * as X from 'echarts'
  let m = line.match(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]echarts['"]/);
  if (m) {
    return line.replace(
      /import\s*\*\s*as\s+(\w+)\s+from\s*['"]echarts['"]/,
      "import $1 from '@/config/echarts/setup'",
    );
  }
  // import { ... } from 'echarts'（单行）
  m = line.match(/import\s*\{([^}]*)\}\s*from\s*['"]echarts['"]/);
  if (!m) return null;
  const body = m[1];
  const idents = body
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const a = s.match(/^(.+?)\s+as\s+(.+)$/);
      return a ? { o: a[1].trim(), l: a[2].trim() } : { o: s, l: s };
    });
  const values = idents.filter((i) => VALUE_IDENTS.has(i.o));
  const types = idents.filter((i) => !VALUE_IDENTS.has(i.o));
  const out = [];
  if (values.length) {
    out.push(
      `import { ${values.map((i) => (i.o === i.l ? i.o : `${i.o} as ${i.l}`)).join(', ')} } from '@/config/echarts/setup';`,
    );
  }
  if (types.length) {
    out.push(
      `import type { ${types.map((i) => (i.o === i.l ? i.o : `${i.o} as ${i.l}`)).join(', ')} } from 'echarts';`,
    );
  }
  return out.join('\n');
}

const files = walk(srcDir, []);
let changed = 0;
for (const file of files) {
  if (file.endsWith('capability-profiles.ts')) continue; // 文档示例字符串，跳过
  if (file.endsWith('config/echarts/setup.ts')) continue; // 入口自身，跳过
  let content = readFileSync(file, 'utf8');
  if (!content.includes("from 'echarts'") && !content.includes('from "echarts"')) continue;
  const newContent = content
    .split('\n')
    .map((line) => {
      if (line.includes("from 'echarts'") || line.includes('from "echarts"')) {
        const r = rewriteLine(line);
        if (r !== null) return r;
      }
      return line;
    })
    .join('\n');
  if (newContent !== content) {
    writeFileSync(file, newContent, 'utf8');
    changed += 1;
    console.log('modified:', file);
  }
}
console.log(`done: ${changed} file(s) rewritten`);
