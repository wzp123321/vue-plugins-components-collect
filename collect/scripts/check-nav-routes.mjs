#!/usr/bin/env node
/**
 * 导航 <-> 路由一致性校验（防漂移守卫）
 *
 * 背景：侧边栏导航（src/views/layout/aside-box/constant.ts）与路由
 * （src/router/modules/*.ts + index.ts）是双注册，新增页面容易只改一处。
 * 本脚本检查三项，任一失败即 exit 1：
 *   1. 导航条目的 path 必须存在于路由中（防死链）
 *   2. 路由 path（白名单除外）必须被导航收录（防页面不可达）
 *   3. 路由动态 import 的 .vue 目标文件必须存在（防删页不留引用）
 *
 * 用法：node ./scripts/check-nav-routes.mjs（collect/ 目录下）
 * 已挂到 .husky/pre-commit，也可手动 npm run check:nav。
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

// 非示例路由：首页、根重定向、404 兜底，不进侧边栏属预期
const ROUTE_ALLOWLIST = new Set(['/', '/home', '/:pathMatch(.*)*']);

function collectPaths(file) {
  const content = readFileSync(resolve(srcDir, file), 'utf8');
  return [...content.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
}

function collectImports(file) {
  const content = readFileSync(resolve(srcDir, file), 'utf8');
  return [...content.matchAll(/import\('([^']+\.vue)'\)/g)].map((m) => m[1]);
}

const modulesDir = resolve(srcDir, 'router/modules');
const routerFiles = [
  ...readdirSync(modulesDir)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => `router/modules/${name}`),
  'router/index.ts',
];

const routePaths = routerFiles.flatMap((file) => collectPaths(file));
const importTargets = routerFiles.flatMap((file) =>
  collectImports(file).map((target) => ({ from: file, target })),
);
const navContent = readFileSync(
  resolve(srcDir, 'views/layout/aside-box/constant.ts'),
  'utf8',
);
const navPaths = [...navContent.matchAll(/path:\s*'(\/[^']+)'/g)].map((m) => m[1]);

const errors = [];

for (const path of navPaths) {
  if (!routePaths.includes(path)) errors.push(`死链：导航 ${path} 在路由中不存在`);
}
for (const path of routePaths) {
  if (!ROUTE_ALLOWLIST.has(path) && !navPaths.includes(path)) {
    errors.push(`未收录：路由 ${path} 缺少侧边栏导航条目`);
  }
}
for (const { from, target } of importTargets) {
  const abs = resolve(srcDir, dirname(from), target);
  if (!existsSync(abs)) errors.push(`缺失文件：${from} -> ${target}`);
}

console.log(
  `check:nav — 路由 ${routePaths.length} 条，导航 ${navPaths.length} 条，import 目标 ${importTargets.length} 个`,
);

if (errors.length > 0) {
  console.error(`\n发现 ${errors.length} 处不一致：`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error(
    '\n修复方式：新页面需同时注册路由（src/router/modules/*.ts）和导航（src/views/layout/aside-box/constant.ts）。',
  );
  process.exit(1);
}

console.log('OK：导航与路由双向一致，import 目标全部存在');
