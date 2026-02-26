#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 依赖白名单配置文件路径
const WHITELIST_FILE = path.join(__dirname, '..', 'dependency-whitelist.json');
// package.json 文件路径
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
 * @param {Array<string>} dependenciesToCheck 要检查的依赖列表
 * @param {Object} options 配置选项
 * @param {boolean} options.silent 是否静默模式（不输出信息）
 * @param {boolean} options.debug 是否启用调试信息
 * @returns {boolean} 检查结果
 */
function checkDependencies(dependenciesToCheck = [], { silent = false, debug = false } = {}) {
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

    // 合并所有允许的依赖（dependencies 和 devDependencies）
    const allowedDependencies = {
      ...(whitelist.dependencies || {}),
      ...(whitelist.devDependencies || {}),
    };

    if (debug) {
      console.log('\n🔍 调试信息：');
      console.log(`允许的依赖数量：${Object.keys(allowedDependencies).length}`);
      console.log(`要检查的依赖数量：${dependenciesToCheck.length}`);
    }

    const invalidDependencies = [];
    for (const dep of dependenciesToCheck) {
      const m = typeof dep === 'string' ? dep.match(/^(?:@[^/]+\/[^@]+|[^@]+)(?=@|$)/) : null;
      const depName = m ? m[0] : (dep || '').trim();
      if (depName && !allowedDependencies[depName]) invalidDependencies.push(depName);
    }

    // 如果有不在白名单中的依赖
    if (invalidDependencies.length > 0) {
      const packageJson = readJSONFile(PACKAGE_FILE, 'package.json');
      const removed = { dependencies: [], devDependencies: [], optionalDependencies: [], peerDependencies: [] };
      const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

      for (const dep of invalidDependencies) {
        for (const section of sections) {
          if (packageJson[section] && Object.prototype.hasOwnProperty.call(packageJson[section], dep)) {
            delete packageJson[section][dep];
            removed[section].push(dep);
          }
        }
      }

      fs.writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson, null, 2));

      if (!silent) {
        console.error('\n❌ 发现不在白名单中的依赖，已从 package.json 中删除：\n');
        const printed = new Set();
        sections.forEach((section) => {
          removed[section].forEach((d) => printed.add(d));
        });
        invalidDependencies.forEach((d) => printed.add(d));
        Array.from(printed).forEach((dep, index) => console.error(`${index + 1}. ${dep}`));
        console.error('\n请重新执行安装命令。\n');
      }
      process.exit(1);
    }

    // 所有依赖都在白名单中
    if (!silent) {
      console.log('✅ 依赖白名单检查通过！');
      if (debug) {
        console.log(`检查的依赖数量：${dependenciesToCheck.length}`);
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

/**
 * 从命令行参数中提取要安装的依赖
 * @returns {Array<string>} 要安装的依赖列表
 */
function getDependenciesFromArgs() {
  const extractName = (spec) => {
    if (!spec) return '';
    const m = spec.match(/^(?:@[^/]+\/[^@]+|[^@]+)(?=@|$)/);
    return m ? m[0] : spec;
  };

  const raw = process.env.npm_config_argv;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const src = Array.isArray(parsed.original) && parsed.original.length ? parsed.original : parsed.cooked || [];
      const result = [];
      for (const a of src) {
        if (a === 'install' || a === 'add') continue;
        if (a.startsWith('--')) continue;
        if (a.startsWith('-')) continue;
        if (!a) continue;
        result.push(extractName(a));
      }
      return result.filter(Boolean);
    } catch (_) {
      // fallback below
    }
  }

  const args = process.argv.slice(2);
  const result = [];
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === 'install' || arg === 'add') {
      i++;
      continue;
    }
    if (arg.startsWith('--')) {
      i++;
      continue;
    }
    if (arg.startsWith('-')) {
      i++;
      continue;
    }
    if (arg) {
      result.push(extractName(arg));
    }
    i++;
  }
  return result.filter(Boolean);
}

/**
 * 检查 package.json 中的所有依赖
 * @returns {Array<string>} package.json 中的所有依赖名称
 */
function getDependenciesFromPackageJson() {
  const packageJson = readJSONFile(PACKAGE_FILE, 'package.json');
  const dependencies = [];

  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.optionalDependencies || {}),
    ...(packageJson.peerDependencies || {}),
  };

  for (const depName of Object.keys(allDependencies)) {
    if (depName) {
      // 确保依赖名称不为空
      dependencies.push(depName);
    }
  }

  return dependencies;
}

// 解析命令行参数
const debug = process.argv.includes('--debug');
const silent = process.argv.includes('--silent');

// 从命令行参数中提取要安装的依赖
const dependenciesFromArgs = getDependenciesFromArgs();

if (dependenciesFromArgs.length > 0) {
  // 如果有要安装的依赖，检查这些依赖
  console.log('🔍 检查要安装的依赖...');
  const dependenciesFromPackageJson = getDependenciesFromPackageJson();
  checkDependencies([...dependenciesFromArgs, ...dependenciesFromPackageJson], { silent, debug });
} else {
  // 如果没有要安装的依赖，检查 package.json 中的所有依赖
  console.log('🔍 检查 package.json 中的依赖...');
  const dependenciesFromPackageJson = getDependenciesFromPackageJson();
  checkDependencies(dependenciesFromPackageJson, { silent, debug });
}
