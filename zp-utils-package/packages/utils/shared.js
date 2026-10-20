import fs from 'fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { mkdirpSync } from 'mkdirp';

/**
 * 核心函数：获取项目根目录（从当前命令执行目录向上查找package.json）
 * 无论工具包安装在node_modules的哪个层级，都能定位到项目根目录
 */
export function getProjectRoot() {
  let currentDir = process.cwd(); // 从用户执行命令的目录开始查找
  const systemRoot = path.parse(currentDir).root; // 系统根目录（如C:\或/）

  // 向上遍历目录，直到找到package.json或到达系统根目录
  while (currentDir !== systemRoot) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir; // 找到项目根目录（包含package.json的目录）
    }
    currentDir = path.dirname(currentDir); // 向上一层目录
  }

  throw new Error('无法找到项目根目录，请确保在项目目录下执行命令（需存在package.json）');
}

/**
 * 生成about.json（基于项目根目录的相对路径）
 * @param {string} outputRelativePath 相对于项目根目录的输出路径（如'dist/build/h5/about.json'）
 */
export function generateAboutJson(outputRelativePath) {
  try {
    const projectRoot = getProjectRoot(); // 获取项目根目录

    // 1. 读取项目根目录的package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 2. 获取当前Git提交ID（在项目根目录执行git命令）
    const commitId = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      cwd: projectRoot // 强制在项目根目录执行git命令（避免仓库识别错误）
    });

    // 3. 计算输出文件的绝对路径
    const outputPath = path.join(projectRoot, outputRelativePath);

    // 4. 确保输出目录存在（自动创建多级目录）
    mkdirpSync(path.dirname(outputPath));

    // 5. 写入about.json
    const jsonData = {
      title: packageJson.name,
      version: packageJson.version,
      build: commitId.trim(), // 去除commitId中的换行符
      copyright: `Copyright@${new Date().getFullYear()} 南京天溯自动化控制系统有限公司`
    };
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`✅ 成功生成：${outputPath}`);
  } catch (error) {
    console.error('❌ 生成about.json失败：', error.message);
    process.exit(1); // 出错时终止进程
  }
}