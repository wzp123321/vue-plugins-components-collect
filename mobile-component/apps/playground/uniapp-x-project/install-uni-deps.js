#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否为 Windows 系统
const isWindows = process.platform === 'win32';

// 执行命令的包装函数，兼容 Windows 系统
function executeCommand(command, options = {}) {
  if (isWindows) {
    return execSync(`cmd.exe /c ${command}`, options);
  } else {
    return execSync(command, options);
  }
}

// 从 npm 仓库获取包的信息
function getPackageInfoFromNpm(packageName, version) {
  try {
    console.log(`\nGetting package info for ${packageName}@${version}...`);
    const command = `npm view ${packageName}@${version} --json`;
    const output = executeCommand(command, { stdio: 'pipe' });
    const packageInfo = JSON.parse(output.toString());
    console.log(`Package info received:`, JSON.stringify(packageInfo, null, 2));
    return packageInfo;
  } catch (error) {
    console.warn(`⚠️  Error getting package info for ${packageName}@${version}:`, error.message);
    return null;
  }
}

// 读取配置文件
const configPath = path.join(__dirname, 'uni.dependencies.json');
if (!fs.existsSync(configPath)) {
  console.error('Error: uni.dependencies.json file not found!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 检查版本兼容性（遵循 npm 语义化版本规则）
function isVersionCompatible(installedVersion, expectedVersion) {
  console.log(`\nChecking version compatibility for ${installedVersion} vs ${expectedVersion}...`);
  console.log(`\nInstalled version: ${installedVersion}`);
  console.log(`\nExpected version: ${expectedVersion}`);
  
  // 移除版本号前的 v 前缀（如果有）
  const cleanInstalledVersion = installedVersion.replace(/^v/, '');
  const cleanExpectedVersion = expectedVersion.replace(/^v/, '');
  
  // 处理精确版本匹配
  if (!cleanExpectedVersion.startsWith('^') && !cleanExpectedVersion.startsWith('~')) {
    const result = cleanInstalledVersion === cleanExpectedVersion;
    console.log(`\nExact version match: ${result}`);
    return result;
  }
  
  // 解析版本号
  const parseVersion = (version) => {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  };
  
  const installed = parseVersion(cleanInstalledVersion);
  const expected = parseVersion(cleanExpectedVersion.replace(/^[~^]/, ''));
  
  console.log(`\nParsed versions:`);
  console.log(`Installed: ${installed.major}.${installed.minor}.${installed.patch}`);
  console.log(`Expected: ${expected.major}.${expected.minor}.${expected.patch}`);
  
  // 处理 ^ 前缀（兼容相同主版本号的所有版本）
  if (cleanExpectedVersion.startsWith('^')) {
    let result;
    if (expected.major === 0) {
      if (expected.minor === 0) {
        // 对于 0.0.x 版本，^ 只允许相同的主版本号、次版本号和补丁号
        result = installed.major === expected.major && 
               installed.minor === expected.minor && 
               installed.patch >= expected.patch;
        console.log(`\n^0.0.x version check: ${result}`);
      } else {
        // 对于 0.x.x 版本（x > 0），^ 行为与 ~ 相同
        result = installed.major === expected.major && 
               installed.minor === expected.minor && 
               installed.patch >= expected.patch;
        console.log(`\n^0.x.x version check: ${result}`);
      }
    } else {
      // 对于 1.0.0 及以上版本，^ 允许相同主版本号的所有版本
      result = installed.major === expected.major && 
             (installed.minor > expected.minor || 
              (installed.minor === expected.minor && installed.patch >= expected.patch));
      console.log(`\n^1.0.0+ version check: ${result}`);
    }
    return result;
  }
  
  // 处理 ~ 前缀（兼容相同主版本号和次版本号的所有版本）
  if (cleanExpectedVersion.startsWith('~')) {
    const result = installed.major === expected.major && 
           installed.minor === expected.minor && 
           installed.patch >= expected.patch;
    console.log(`\n~ version check: ${result}`);
    return result;
  }
  
  console.log(`\nNo match found: false`);
  return false;
}

// 检查已安装的版本
function checkInstalledVersion(packageName) {
  try {
    const uniModulesPath = path.join(__dirname, 'src', 'uni_modules', packageName);
    const packageJsonPath = path.join(uniModulesPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageInfo.version;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 读取包的 package.json 信息
function getPackageInfo(packageName) {
  try {
    const uniModulesPath = path.join(__dirname, 'src', 'uni_modules', packageName);
    const packageJsonPath = path.join(uniModulesPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageInfo;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 执行 npx 命令安装依赖
function installPackage(packageName, version) {
  console.log(`\nInstalling ${packageName}@${version}...`);
  
  // 检查已安装的版本
  const installedVersion = checkInstalledVersion(packageName);
  if (installedVersion) {
    console.log(`Found existing installation: ${packageName}@${installedVersion}`);
    if (isVersionCompatible(installedVersion, version)) {
      console.log(`✓ Version is compatible, skipping installation`);
      return;
    } else {
      console.warn(`⚠️  Version mismatch: expected ${version}, found ${installedVersion}`);
      console.log(`Removing existing installation and reinstalling...`);
      
      // 删除已有的安装
      const uniModulesPath = path.join(__dirname, 'src', 'uni_modules', packageName);
      if (fs.existsSync(uniModulesPath)) {
        try {
          fs.rmSync(uniModulesPath, { recursive: true, force: true });
          console.log(`✓ Removed existing installation`);
        } catch (error) {
          console.warn(`⚠️  Error removing existing installation:`, error.message);
        }
      }
    }
  }
  
  try {
    // 使用 npx -y 带上版本号执行包
    executeCommand(`npx -y ${packageName}@${version}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✓ ${packageName}@${version} installed successfully`);
  } catch (error) {
    console.error(`Error installing ${packageName}:`, error.message);
  }
}

// 安装包的 dependencies
function installPackageDependencies() {
  console.log('\nInstalling package dependencies...');
  
  // 收集所有已安装包的 dependencies
  const deps = {};
  
  Object.entries(config).forEach(([packageName, version]) => {
    const packageInfo = getPackageInfo(packageName);
    if (packageInfo && packageInfo.dependencies) {
      Object.entries(packageInfo.dependencies).forEach(([depPackage, depVersion]) => {
        if (!deps[depPackage] || deps[depPackage] !== depVersion) {
          deps[depPackage] = depVersion;
        }
      });
    }
  });
  
  // 单独安装每个依赖
  if (Object.keys(deps).length > 0) {
    console.log('Installing dependencies:', Object.keys(deps).join(', '));
    
    Object.entries(deps).forEach(([depPackage, depVersion]) => {
      console.log(`Installing ${depPackage}@${depVersion}...`);
      try {
        // 单独安装每个依赖
        executeCommand(`npm install ${depPackage}@${depVersion}`, {
          stdio: 'inherit',
          cwd: __dirname
        });
        console.log(`✓ ${depPackage}@${depVersion} installed successfully`);
      } catch (error) {
        console.error(`Error installing ${depPackage}:`, error.message);
      }
    });
  } else {
    console.log('✓ No dependencies to install');
  }
}

// 递归检查版本冲突
function checkVersionConflicts() {
  console.log('\nChecking version conflicts...');
  
  const checkedPackages = new Set();
  
  // 递归检查包的 uniPeerDependencies
  function checkPeerDependencies(packageName, version, requiredBy) {
    // 避免重复检查
    if (checkedPackages.has(packageName)) {
      return;
    }
    checkedPackages.add(packageName);
    
    // 从 npm 仓库获取包的信息
    const packageInfo = getPackageInfoFromNpm(packageName, version);
    
    if (packageInfo && packageInfo.uniPeerDependencies) {
      Object.entries(packageInfo.uniPeerDependencies).forEach(([peerPackage, peerVersion]) => {
        // 检查 config 中是否已指定该包的版本
        if (config[peerPackage]) {
          const configVersion = config[peerPackage];
          // 检查 config 版本是否符合 uniPeerDependencies 要求
          if (!isVersionCompatible(configVersion, peerVersion)) {
            console.log('\n❌ Version conflict detected:');
            console.log(`- ${peerPackage}: expected ${peerVersion}, actual ${configVersion} (required by ${requiredBy || packageName})`);
            console.log('\nPlease resolve this conflict and run the script again.');
            process.exit(1);
          }
        }
        
        // 递归检查 peerPackage 的 uniPeerDependencies
        if (config[peerPackage]) {
          checkPeerDependencies(peerPackage, config[peerPackage], packageName);
        }
      });
    }
  }
  
  // 检查所有配置的包
  Object.entries(config).forEach(([packageName, version]) => {
    checkPeerDependencies(packageName, version);
  });
  
  console.log('✓ No version conflicts detected');
}

// 检查并安装 uniPeerDependencies
function installUniPeerDependencies() {
  console.log('\nChecking uniPeerDependencies...');
  
  // 收集所有已安装包的 uniPeerDependencies
  const peerDeps = {};
  
  Object.entries(config).forEach(([packageName, version]) => {
    const packageInfo = getPackageInfo(packageName);
    if (packageInfo && packageInfo.uniPeerDependencies) {
      Object.entries(packageInfo.uniPeerDependencies).forEach(([peerPackage, peerVersion]) => {
        if (!peerDeps[peerPackage] || peerDeps[peerPackage] !== peerVersion) {
          peerDeps[peerPackage] = peerVersion;
        }
      });
    }
  });
  
  // 安装 uniPeerDependencies
  Object.entries(peerDeps).forEach(([peerPackage, peerVersion]) => {
    // 检查 config 中是否已指定该包的版本
    if (config[peerPackage]) {
      const configVersion = config[peerPackage];
      // 使用 config 中的版本
      installPackage(peerPackage, configVersion);
    } else {
      // config 中未指定，使用 uniPeerDependencies 中的版本
      installPackage(peerPackage, peerVersion);
    }
  });
}

// 执行安装
console.log('Starting UniApp dependencies setup...');

// 处理配置对象
if (typeof config === 'object' && config !== null) {
  // 先检查版本冲突
  checkVersionConflicts();
  
  // 安装所有包
  Object.entries(config).forEach(([packageName, version]) => {
    installPackage(packageName, version);
  });
  
  // 安装 uniPeerDependencies
  installUniPeerDependencies();
  
  // 安装 package dependencies
  installPackageDependencies();
}

console.log('\nSetup completed!');

