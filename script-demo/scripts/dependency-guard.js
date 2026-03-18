import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function parsePackageName(packageSpec) {
  if (!packageSpec || typeof packageSpec !== 'string') return null;
  const spec = packageSpec.trim();
  if (!spec) return null;

  if (spec.startsWith('@')) {
    const firstSlash = spec.indexOf('/');
    if (firstSlash === -1) return null;
    const secondAt = spec.indexOf('@', firstSlash + 1);
    return secondAt === -1 ? spec : spec.slice(0, secondAt);
  }

  const atIndex = spec.indexOf('@');
  return atIndex === -1 ? spec : spec.slice(0, atIndex);
}

function getInstallPackagesFromNpmConfigArgv() {
  const raw = process.env.npm_config_argv;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const argv = Array.isArray(parsed.original)
      ? parsed.original
      : Array.isArray(parsed.cooked)
        ? parsed.cooked
        : [];

    const commandIndex = argv.findIndex((x) => x === 'install' || x === 'i' || x === 'ci');
    const startIndex = commandIndex === -1 ? 1 : commandIndex + 1;
    const candidates = argv.slice(startIndex);

    return candidates.filter((x) => typeof x === 'string' && x.trim() && !x.trim().startsWith('-'));
  } catch {
    return [];
  }
}

async function readPackageJson(packageJsonPath) {
  const raw = await readFile(packageJsonPath, 'utf8');
  return JSON.parse(raw);
}

async function writePackageJson(packageJsonPath, json) {
  await writeFile(packageJsonPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

function getWhitelistFromPackageJson(packageJson) {
  const whitelist = packageJson?.dependencyGuard?.whitelist;
  if (Array.isArray(whitelist)) {
    return new Set(whitelist.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()));
  }
  return new Set();
}

async function main() {
  const filename = fileURLToPath(import.meta.url);
  const currentDir = dirname(filename);
  const packageJsonPath = resolve(currentDir, '../package.json');

  const packageJson = await readPackageJson(packageJsonPath);
  const whitelistSet = getWhitelistFromPackageJson(packageJson);

  if (whitelistSet.size === 0) {
    console.error('[dependency-guard] 未配置依赖白名单：请在 package.json 中添加 dependencyGuard.whitelist');
    process.exit(1);
  }

  const installPackages = getInstallPackagesFromNpmConfigArgv();

  if (installPackages.length > 0) {
    const illegalSpecs = installPackages.filter((spec) => {
      const name = parsePackageName(spec);
      if (!name) return true;
      return !whitelistSet.has(name);
    });

    if (illegalSpecs.length > 0) {
      console.error(`[dependency-guard] 拦截安装：以下依赖不在白名单中：${illegalSpecs.join(', ')}`);
      process.exit(1);
    }

    return;
  }

  const dependencies = packageJson.dependencies ?? {};
  const nextDependencies = {};
  const removed = [];

  for (const [name, version] of Object.entries(dependencies)) {
    if (whitelistSet.has(name)) {
      nextDependencies[name] = version;
    } else {
      removed.push(name);
    }
  }

  if (removed.length > 0) {
    packageJson.dependencies = nextDependencies;
    await writePackageJson(packageJsonPath, packageJson);
    console.warn(`[dependency-guard] 已从 dependencies 中移除非白名单依赖：${removed.join(', ')}`);
  }
}

main().catch((err) => {
  console.error('[dependency-guard] 执行失败：', err);
  process.exit(1);
});
