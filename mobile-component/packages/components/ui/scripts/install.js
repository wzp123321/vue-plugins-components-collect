#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否为 Windows 系统
const isWindows = process.platform === 'win32';

// 执行命令的包装函数，兼容 Windows 系统
function executeCommand(command, options = {}) {
  if (isWindows) {
    // 在 Windows 上使用 cmd.exe /c 执行命令
    return execSync(`cmd.exe /c ${command}`, options);
  } else {
    // 在非 Windows 系统上直接执行命令
    return execSync(command, options);
  }
}

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (exclude.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyDir(s, d, exclude);
    } else if (stat.isSymbolicLink()) {
      const real = fs.realpathSync(s);
      const realStat = fs.statSync(real);
      if (realStat.isDirectory()) {
        copyDir(real, d, exclude);
      } else {
        fs.copyFileSync(real, d);
      }
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function rimraf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function resolvePackageInfo() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return {
    name: packageJson.name,
    dependencies: packageJson.dependencies || {},
    uniPeerDependencies: packageJson.uniPeerDependencies || {},
  };
}

function installDependencies(dependencies, projectRoot) {
  const depEntries = Object.entries(dependencies);
  if (depEntries.length === 0) return;

  console.log('🔧 安装 dependencies');

  try {
    const depArgs = depEntries.map(([name, version]) => `${name}@${version}`).join(' ');
    executeCommand(`npx npm install --save ${depArgs}`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });
    console.log('✅ dependencies 安装完成');
  } catch (error) {
    console.error('❌ dependencies 安装失败:', error.message);
  }
}

function main() {
  console.log('📦 开始安装配置');

  // 确保 projectRoot 是正确的项目目录
  // 当通过 npx 执行时，INIT_CWD 会设置为调用目录
  // 如果没有 INIT_CWD，则使用当前工作目录
  let projectRoot = process.env.INIT_CWD;

  // 验证 projectRoot 是否存在且是一个目录
  if (!projectRoot || !fs.existsSync(projectRoot) || !fs.lstatSync(projectRoot).isDirectory()) {
    // 如果 INIT_CWD 无效，尝试使用当前工作目录
    projectRoot = process.cwd();

    // 进一步验证：如果当前目录是包的临时安装目录，尝试向上查找
    // 检查是否存在 package.json 文件，判断是否为项目目录
    let currentPath = projectRoot;
    let foundProjectDir = false;

    for (let i = 0; i < 5; i++) {
      // 最多向上查找 5 级
      if (fs.existsSync(path.join(currentPath, 'package.json'))) {
        projectRoot = currentPath;
        foundProjectDir = true;
        break;
      }
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) break; // 到达根目录
      currentPath = parentPath;
    }

    if (!foundProjectDir) {
      console.error('❌ 无法确定项目根目录');
      process.exit(1);
    }
  }

  console.log(`📁 项目根目录: ${projectRoot}`);
  const srcDir = path.join(projectRoot, 'src');
  const uniModulesBase = fs.existsSync(srcDir)
    ? path.join(srcDir, 'uni_modules')
    : path.join(projectRoot, 'uni_modules');
  const targetPkgDir = path.join(uniModulesBase, '@tiansu/ts-mobile-ui');
  const pkgRoot = path.resolve(__dirname, '..');
  const distDir = path.join(pkgRoot, 'dist');
  const pkgJsonPath = path.join(pkgRoot, 'package.json');

  const pkgInfo = resolvePackageInfo();

  try {
    // 安装到 uni_modules
    if (!fs.existsSync(distDir)) throw new Error('dist not found. Please run build before install.');
    if (!fs.existsSync(uniModulesBase)) fs.mkdirSync(uniModulesBase, { recursive: true });
    rimraf(targetPkgDir);
    fs.mkdirSync(targetPkgDir, { recursive: true });
    copyDir(distDir, targetPkgDir);
    if (fs.existsSync(pkgJsonPath)) {
      fs.copyFileSync(pkgJsonPath, path.join(targetPkgDir, 'package.json'));
    }
    console.log(`[ts-mobile-ui] Installed to ${targetPkgDir}`);

    // dependencies 由 install-uni-deps.js 统一管理安装

    // uniPeerDependencies 由 install-uni-deps.js 统一管理安装

    console.log(`\n🎉 ${pkgInfo.name} 安装配置完成！`);
  } catch (e) {
    console.error('❌ 安装失败:', e.message);
    process.exit(1);
  }
}

main();
