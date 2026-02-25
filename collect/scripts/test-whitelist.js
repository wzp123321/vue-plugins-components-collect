import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_FILE = path.join(__dirname, '..', 'package.json');
const BACKUP_FILE = path.join(__dirname, '..', 'package.json.backup');

console.log('🧪 开始测试依赖白名单功能...\n');

/**
 * 备份 package.json 文件
 * @returns {boolean} 备份是否成功
 */
function backupPackageJson() {
  try {
    if (!fs.existsSync(PACKAGE_FILE)) {
      console.error('❌ 错误：package.json 文件不存在！');
      return false;
    }
    
    const content = fs.readFileSync(PACKAGE_FILE, 'utf-8');
    fs.writeFileSync(BACKUP_FILE, content);
    console.log('✅ 已备份 package.json');
    return true;
  } catch (error) {
    console.error('❌ 备份 package.json 失败：', error.message);
    return false;
  }
}

/**
 * 恢复 package.json 文件
 * @returns {boolean} 恢复是否成功
 */
function restorePackageJson() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const content = fs.readFileSync(BACKUP_FILE, 'utf-8');
      fs.writeFileSync(PACKAGE_FILE, content);
      fs.unlinkSync(BACKUP_FILE);
      console.log('✅ 已恢复 package.json');
      return true;
    } else {
      console.warn('⚠️  备份文件不存在，无法恢复');
      return false;
    }
  } catch (error) {
    console.error('❌ 恢复 package.json 失败：', error.message);
    return false;
  }
}

/**
 * 添加测试依赖到 package.json
 * @returns {boolean} 添加是否成功
 */
function addTestDependency() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'));
    
    // 确保 dependencies 字段存在
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    packageJson.dependencies['test-package-not-in-whitelist'] = '^1.0.0';
    fs.writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson, null, 2));
    console.log('✅ 已添加测试依赖到 package.json');
    return true;
  } catch (error) {
    console.error('❌ 添加测试依赖失败：', error.message);
    return false;
  }
}

/**
 * 移除测试依赖
 * @returns {boolean} 移除是否成功
 */
function removeTestDependency() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'));
    
    if (packageJson.dependencies) {
      delete packageJson.dependencies['test-package-not-in-whitelist'];
      fs.writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson, null, 2));
      console.log('✅ 已移除测试依赖');
      return true;
    }
    
    console.warn('⚠️  dependencies 字段不存在，无需移除');
    return false;
  } catch (error) {
    console.error('❌ 移除测试依赖失败：', error.message);
    return false;
  }
}

/**
 * 运行测试
 */
async function runTest() {
  try {
    // 测试 1: 正常情况（所有依赖都在白名单中）
    console.log('测试 1: 正常情况（所有依赖都在白名单中）');
    console.log('----------------------------------------');
    const { checkDependencies } = await import('./check-dependencies.js');
    const result1 = checkDependencies({ silent: false });
    console.log(`结果: ${result1 ? '通过 ✅' : '失败 ❌'}\n`);

    // 测试 2: 添加不在白名单中的依赖
    console.log('测试 2: 添加不在白名单中的依赖');
    console.log('----------------------------------------');
    
    if (!backupPackageJson()) {
      console.error('❌ 测试失败：无法备份 package.json');
      return;
    }
    
    if (!addTestDependency()) {
      console.error('❌ 测试失败：无法添加测试依赖');
      restorePackageJson();
      return;
    }
    
    try {
      const result2 = checkDependencies({ silent: false });
      console.log(`结果: ${result2 ? '通过 ❌ (应该失败)' : '失败 ✅ (预期行为)'}\n`);
    } catch (error) {
      console.log('结果: 失败 ✅ (预期行为)\n');
    } finally {
      restorePackageJson();
    }

    // 测试 3: 恢复正常状态
    console.log('测试 3: 恢复正常状态');
    console.log('----------------------------------------');
    
    const result3 = checkDependencies({ silent: false });
    console.log(`结果: ${result3 ? '通过 ✅' : '失败 ❌'}\n`);

    console.log('🎉 所有测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    restorePackageJson();
    process.exit(1);
  }
}

// 运行测试
runTest();
