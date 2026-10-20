import { generateAboutJson } from './shared.js';

/**
 * 生成about.json（支持自定义输出目录）
 * @param {string} outputDir 输出目录（相对于项目根目录），默认：dist/build/h5
 */
export function generateH5AboutJson(outputDir = 'dist/build/h5') {
  // 输出文件路径 = 输出目录 + about.json
  const outputRelativePath = `${outputDir}/about.json`;
  generateAboutJson(outputRelativePath);
}