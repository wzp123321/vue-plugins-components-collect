import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WHITELIST_FILE = path.join(__dirname, '..', 'dependency-whitelist.json');
const PACKAGE_FILE = path.join(__dirname, '..', 'package.json');

/**
 * 读取 JSON 文件
 * @param {string} filePath 文件路径
 * @param {string} fileType 文件类型描述
 * @returns {Object} JSON 对象
 */
function readJSONFile(filePath, fileType) {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ 错误：${fileType} 文件不存在！`);
      console.error(`文件路径：${filePath}`);
      console.error(`请确保 ${fileType} 文件存在且格式正确。\n`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const json = JSON.parse(content);
      return json;
    } catch (parseError) {
      console.error(`\n❌ 错误：${fileType} 文件格式不正确！`);
      console.error(`错误信息：${parseError.message}`);
      console.error(`请检查 ${fileType} 文件的 JSON 格式是否正确。\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ 错误：读取 ${fileType} 文件失败！`);
    console.error(`错误信息：${error.message}`);
    console.error(`请检查文件权限和路径是否正确。\n`);
    process.exit(1);
  }
}

/**
 * 检查依赖是否在白名单中
 * @param {Object} options 配置选项
 * @param {boolean} options.silent 是否静默模式（不输出信息）
 * @param {boolean} options.debug 是否启用调试信息
 * @returns {boolean} 检查结果
 */
function checkDependencies({ silent = false, debug = false } = {}) {
  try {
    // 读取白名单配置
    const whitelist = readJSONFile(WHITELIST_FILE, '依赖白名单');
    
    // 验证白名单文件格式
    if (!whitelist.dependencies && !whitelist.devDependencies) {
      console.error('\n❌ 错误：依赖白名单文件格式不正确！');
      console.error('白名单文件必须包含 dependencies 或 devDependencies 字段。');
      console.error('请检查 dependency-whitelist.json 文件格式。\n');
      process.exit(1);
    }

    // 读取 package.json
    const packageJson = readJSONFile(PACKAGE_FILE, 'package.json');

    // 合并所有允许的依赖（dependencies 和 devDependencies）
    const allowedDependencies = {
      ...(whitelist.dependencies || {}),
      ...(whitelist.devDependencies || {}),
    };

    // 合并所有当前的依赖（dependencies 和 devDependencies）
    const packageDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    if (debug) {
      console.log('\n🔍 调试信息：');
      console.log(`允许的依赖数量：${Object.keys(allowedDependencies).length}`);
      console.log(`当前的依赖数量：${Object.keys(packageDependencies).length}`);
    }

    // 存储不在白名单中的依赖
    const invalidDependencies = [];

    // 遍历所有当前依赖，检查是否在白名单中
    for (const [name, version] of Object.entries(packageDependencies)) {
      if (!allowedDependencies[name]) {
        invalidDependencies.push({
          name,
          version,
        });
      }
    }

    // 如果有不在白名单中的依赖
    if (invalidDependencies.length > 0) {
      if (!silent) {
        console.error('\n❌ 依赖白名单检查失败！\n');
        console.error('以下依赖不在白名单中：\n');
        
        // 输出所有不在白名单中的依赖
        invalidDependencies.forEach((dep, index) => {
          console.error(`${index + 1}. ${dep.name}@${dep.version}`);
        });
        
        console.error('\n请将以上依赖添加到 dependency-whitelist.json 文件中，或移除它们。\n');
        console.error('添加新依赖的步骤：');
        console.error('1. 打开 dependency-whitelist.json 文件');
        console.error('2. 在相应的部分（dependencies 或 devDependencies）添加依赖');
        console.error('3. 保存文件并重新运行安装命令\n');
      }
      
      // 退出进程，阻止安装
      process.exit(1);
    }

    // 所有依赖都在白名单中
    if (!silent) {
      console.log('✅ 依赖白名单检查通过！');
      if (debug) {
        console.log(`检查的依赖数量：${Object.keys(packageDependencies).length}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ 错误：依赖检查过程中发生未知错误！');
    console.error(`错误信息：${error.message}`);
    console.error('请检查脚本配置和文件权限。\n');
    process.exit(1);
  }
}

// 解析命令行参数
const debug = process.argv.includes('--debug');

// 执行依赖检查
checkDependencies({ debug });

// 导出检查函数（供其他脚本调用）
export { checkDependencies };
