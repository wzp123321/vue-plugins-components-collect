#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.env.INIT_CWD || process.cwd();

// 检测是否为 uni-app 项目（pages.json 可能在根目录或 src/ 下）
const isUniApp = fs.existsSync(path.join(projectRoot, 'pages.json'))
  || fs.existsSync(path.join(projectRoot, 'src', 'pages.json'));
if (!isUniApp) {
  console.log(`[ts-mobile-installer] 当前目录不是 uni-app 项目，跳过安装 (${projectRoot})`);
  process.exit(0);
}

const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
const uniModulesDir = hasSrc
  ? path.join(projectRoot, 'src', 'uni_modules')
  : path.join(projectRoot, 'uni_modules');

// ---- config ----

const defaultConfig = require('./uni.dependencies.json');
const consumerConfigPath = path.join(projectRoot, 'uni.dependencies.json');

if (!fs.existsSync(consumerConfigPath)) {
  console.log(`[ts-mobile-installer] 未找到 uni.dependencies.json，正在创建默认配置...`);
  fs.writeFileSync(consumerConfigPath, JSON.stringify(defaultConfig, null, 2) + '\n');
  console.log(`  ✓ 已创建 ${consumerConfigPath}`);
}

const config = JSON.parse(fs.readFileSync(consumerConfigPath, 'utf8'));

// ---- utils ----

function isVersionCompatible(installedVersion, expectedVersion) {
  const a = installedVersion.replace(/^v/, '');
  const b = expectedVersion.replace(/^v/, '');
  if (!b.startsWith('^') && !b.startsWith('~')) return a === b;

  const parse = (v) => {
    const [major, minor, patch] = v.replace(/^[~^]/, '').split('.').map(Number);
    return { major: major || 0, minor: minor || 0, patch: patch || 0 };
  };
  const ai = parse(a);
  const bi = parse(b);

  if (b.startsWith('^')) {
    if (bi.major === 0) return ai.major === 0 && ai.minor === bi.minor && ai.patch >= bi.patch;
    return ai.major === bi.major && (ai.minor > bi.minor || (ai.minor === bi.minor && ai.patch >= bi.patch));
  }
  // ~
  return ai.major === bi.major && ai.minor === bi.minor && ai.patch >= bi.patch;
}

function checkInstalledVersion(packageName) {
  try {
    const pj = path.join(uniModulesDir, packageName, 'package.json');
    if (fs.existsSync(pj)) {
      return JSON.parse(fs.readFileSync(pj, 'utf8')).version;
    }
  } catch (_) {}
  return null;
}

function getInstalledPackageInfo(packageName) {
  try {
    const pj = path.join(uniModulesDir, packageName, 'package.json');
    if (fs.existsSync(pj)) return JSON.parse(fs.readFileSync(pj, 'utf8'));
  } catch (_) {}
  return null;
}

function getPackageInfoFromNpm(packageName, version) {
  try {
    const out = execSync(`npm view ${packageName}@${version} --json 2>/dev/null`, { stdio: 'pipe' });
    return JSON.parse(out.toString());
  } catch (e) {
    console.error(`  ⚠ 无法获取 ${packageName}@${version} 的包信息: ${e.stderr ? e.stderr.toString().trim() : e.message}`);
    return null;
  }
}

function resolveExactVersion(packageName, versionRange) {
  try {
    const out = execSync(`npm view ${packageName}@${versionRange} version 2>/dev/null`, { stdio: 'pipe' });
    return out.toString().trim();
  } catch (e) {
    console.error(`  ⚠ 无法解析版本 ${packageName}@${versionRange}: ${e.stderr ? e.stderr.toString().trim() : e.message}`);
    return versionRange;
  }
}

// ---- install ----

function removeUniModule(packageName) {
  const p = path.join(uniModulesDir, packageName);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function installPackage(packageName, version) {
  const installed = checkInstalledVersion(packageName);
  if (installed) {
    if (isVersionCompatible(installed, version)) {
      console.log(`  ✓ ${packageName}@${installed} 已安装，跳过`);
      return;
    }
    console.log(`  ⚠ ${packageName} 版本不兼容 (${installed} vs ${version})，重新安装...`);
    removeUniModule(packageName);
  }
  const exact = resolveExactVersion(packageName, version);
  try {
    execSync(`npx -y ${packageName}@${exact}`, { cwd: projectRoot, stdio: 'inherit' });
  } catch (e) {
    const stderr = e.stderr ? e.stderr.toString().trim() : '';
    const stdout = e.stdout ? e.stdout.toString().trim() : '';
    console.error(`  ✗ ${packageName}@${exact} 安装失败`);
    if (stderr) console.error(`    stderr: ${stderr}`);
    if (stdout) console.error(`    stdout: ${stdout}`);
    if (!stderr && !stdout) console.error(`    ${e.message}`);
  }
}

function installDependencies() {
  const deps = {};
  for (const [name] of Object.entries(config)) {
    const info = getInstalledPackageInfo(name);
    if (info && info.dependencies) {
      Object.entries(info.dependencies).forEach(([dep, ver]) => {
        if (!deps[dep] || deps[dep] !== ver) deps[dep] = ver;
      });
    }
  }
  for (const [dep, ver] of Object.entries(deps)) {
    console.log(`  npm install ${dep}@${ver}`);
    try {
      execSync(`npm install ${dep}@${ver}`, { cwd: projectRoot, stdio: 'inherit' });
    } catch (e) {
      const stderr = e.stderr ? e.stderr.toString().trim() : '';
      console.error(`  ✗ npm install ${dep}@${ver} 失败`);
      if (stderr) console.error(`    ${stderr}`);
    }
  }
}

function checkVersionConflicts() {
  const checked = new Set();
  function check(name, version, requiredBy) {
    if (checked.has(name)) return;
    checked.add(name);
    const info = getPackageInfoFromNpm(name, version);
    if (!info || !info.uniPeerDependencies) return;
    for (const [peer, peerVer] of Object.entries(info.uniPeerDependencies)) {
      if (config[peer] && !isVersionCompatible(config[peer], peerVer)) {
        console.error(`  ❌ 版本冲突: ${peer} 需要 ${peerVer}，实际 ${config[peer]} (来自 ${requiredBy || name})`);
        process.exit(1);
      }
      if (config[peer]) check(peer, config[peer], name);
    }
  }
  for (const [name, version] of Object.entries(config)) {
    check(name, version);
  }
}

function installPeerDependencies() {
  const peers = {};
  for (const [name] of Object.entries(config)) {
    const info = getInstalledPackageInfo(name);
    if (info && info.uniPeerDependencies) {
      Object.entries(info.uniPeerDependencies).forEach(([peer, ver]) => {
        if (!peers[peer] || peers[peer] !== ver) peers[peer] = ver;
      });
    }
  }
  for (const [peer, ver] of Object.entries(peers)) {
    const v = config[peer] || ver;
    installPackage(peer, v);
  }
}

// ---- main ----

console.log(`\n[ts-mobile-installer] 开始安装...`);
console.log(`  项目目录: ${projectRoot}`);
console.log(`  uni_modules: ${uniModulesDir}\n`);

checkVersionConflicts();

console.log('安装组件包:');
for (const [name, version] of Object.entries(config)) {
  installPackage(name, version);
}

console.log('\n检查 peer 依赖:');
installPeerDependencies();

console.log('\n安装 npm 依赖:');
installDependencies();

console.log('\n[ts-mobile-installer] 完成\n');
