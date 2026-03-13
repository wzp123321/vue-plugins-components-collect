#!/usr/bin/env node

/**
 * 页面代码生成脚本
 * 根据 userManage 页面模板生成新的页面代码
 * 
 * 使用方法：
 * node scripts/generate-page.js <模块名称> [模块中文名]
 * 
 * 示例：
 * node scripts/generate-page.js orderManage 订单管理
 * 
 * 注意：
 * - 生成的 Mock 数据文件使用简化格式（minWidth 而不是 width）
 * - 列配置格式：{ prop, label, checked, minWidth, align }
 * - 返回格式：{ columns, pageSize }（不包含 tableCode）
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('❌ 错误: 请提供模块名称');
  console.log('使用方法: node scripts/generate-page.js <模块名称> [模块中文名]');
  console.log('示例: node scripts/generate-page.js orderManage 订单管理');
  process.exit(1);
}

const moduleName = args[0]; // 模块名称（驼峰命名，如：orderManage）
const moduleNameCN = args[1] || moduleName; // 模块中文名（如：订单管理）

// 转换为不同命名格式
const toPascalCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const toKebabCase = (str) => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

const moduleNamePascal = toPascalCase(moduleName); // OrderManage
const moduleNameKebab = toKebabCase(moduleName); // order-manage

console.log(`🚀 开始生成 ${moduleNameCN} 页面代码...`);
console.log(`模块名称: ${moduleName}`);
console.log(`模块中文名: ${moduleNameCN}`);
console.log('');

// 定义文件路径
const baseDir = path.resolve(__dirname, '..');
const viewsDir = path.join(baseDir, 'src', 'views', moduleName);
const apisDir = path.join(baseDir, 'src', 'apis', moduleName);

// 创建目录
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  }
};

createDir(viewsDir);
createDir(path.join(viewsDir, 'modules'));
createDir(path.join(viewsDir, 'components'));
createDir(path.join(viewsDir, 'hooks'));
createDir(apisDir);

// 读取模板文件
const readTemplate = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
};

// 替换模板内容
const replaceTemplate = (content, replacements) => {
  let result = content;
  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, replacements[key]);
  });
  return result;
};

// 处理 Mock 文件中的列配置，将 width 设置为空字符串
const processMockColumns = (content) => {
  // 匹配 width: 数字 的模式，替换为 width: ''
  // 匹配 width: 80, width: 200 等
  let result = content;
  
  // 替换 width: 数字, 为 width: '',
  result = result.replace(/width:\s*\d+,/g, "width: '',");
  
  // 替换 width: 数字 后面没有逗号的情况（最后一个字段，后面是换行）
  result = result.replace(/width:\s*\d+\s*\n/g, "width: ''\n");
  
  // 替换 width: 数字 后面是 } 的情况（对象最后一个字段）
  result = result.replace(/width:\s*\d+\s*\}/g, "width: ''\n    }");
  
  return result;
};

// 替换规则 - 注意顺序很重要，先替换长的，再替换短的
const replacements = {
  'userManage模块正在使用 Mock 数据': `${moduleNameCN}模块正在使用 Mock 数据`,
  '用户管理模块 - Mock 数据': `${moduleNameCN}模块 - Mock 数据`,
  '用户管理': moduleNameCN,
  'UserManage': moduleNamePascal,
  'userManage': moduleName,
  'user-manage': moduleNameKebab,
  "'userManage'": `'${moduleName}'`,
  "'/sec/userManage'": `'/sec/${moduleName}'`,
};

// 生成文件
const generateFile = (templatePath, outputPath, customReplacements = {}) => {
  const template = readTemplate(templatePath);
  const finalReplacements = { ...replacements, ...customReplacements };
  const content = replaceTemplate(template, finalReplacements);
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ 生成文件: ${outputPath}`);
};

// 1. 生成页面主文件
const indexVueTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'index.vue');
const indexVueOutput = path.join(viewsDir, 'index.vue');
generateFile(indexVueTemplate, indexVueOutput);

// 2. 生成常量文件
const constantTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'constant.ts');
const constantOutput = path.join(viewsDir, 'constant.ts');
generateFile(constantTemplate, constantOutput, {
  "'userManage'": `'${moduleName}'`,
});

// 3. 生成 API 类型定义
const apiTypesTemplate = path.join(baseDir, 'src', 'apis', 'userManage', 'index.api.ts');
const apiTypesOutput = path.join(apisDir, 'index.api.ts');
generateFile(apiTypesTemplate, apiTypesOutput);

// 4. 生成 API 主文件
const apiIndexTemplate = path.join(baseDir, 'src', 'apis', 'userManage', 'index.ts');
const apiIndexOutput = path.join(apisDir, 'index.ts');
generateFile(apiIndexTemplate, apiIndexOutput, {
  '/sec/userManage': `/sec/${moduleName}`,
});

// 5. 生成 Mock 数据文件
// 注意：模板文件已使用简化格式（minWidth 而不是 width），生成的代码会自动使用正确的格式
// 如果模板使用旧格式（width），会自动将 width 设置为空字符串
const mockTemplate = path.join(baseDir, 'src', 'apis', 'userManage', 'index.mock.ts');
const mockOutput = path.join(apisDir, 'index.mock.ts');
const mockContent = readTemplate(mockTemplate);
const mockFinalReplacements = { ...replacements };
const mockReplaced = replaceTemplate(mockContent, mockFinalReplacements);
// 处理列配置中的 width，设置为空字符串（如果存在 width 字段）
const mockProcessed = processMockColumns(mockReplaced);
fs.writeFileSync(mockOutput, mockProcessed, 'utf-8');
console.log(`✅ 生成文件: ${mockOutput}`);

// 6. 生成创建表单组件
const createFormTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'modules', 'createForm.vue');
const createFormOutput = path.join(viewsDir, 'modules', 'createForm.vue');
generateFile(createFormTemplate, createFormOutput);

// 7. 生成详情组件（可选）
const detailTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'modules', 'detail.vue');
const detailOutput = path.join(viewsDir, 'modules', 'detail.vue');
if (fs.existsSync(detailTemplate)) {
  generateFile(detailTemplate, detailOutput);
}

// 8. 生成编辑表单组件（可选）
const editFormTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'modules', 'editForm.vue');
const editFormOutput = path.join(viewsDir, 'modules', 'editForm.vue');
if (fs.existsSync(editFormTemplate)) {
  generateFile(editFormTemplate, editFormOutput);
}

// 9. 生成操作按钮 Hook（可选）
const useBtnHandlesTemplate = path.join(baseDir, 'src', 'views', 'userManage', 'hooks', 'useBtnHandles.ts');
const useBtnHandlesOutput = path.join(viewsDir, 'hooks', 'useBtnHandles.ts');
if (fs.existsSync(useBtnHandlesTemplate)) {
  generateFile(useBtnHandlesTemplate, useBtnHandlesOutput);
}

console.log('');
console.log('✨ 代码生成完成！');
console.log('');
console.log('📝 接下来需要手动完成以下工作：');
console.log(`1. 检查并修改 ${viewsDir}/index.vue 中的表格列配置`);
console.log(`2. 检查并修改 ${viewsDir}/constant.ts 中的搜索参数和表格参数`);
console.log(`3. 检查并修改 ${apisDir}/index.api.ts 中的类型定义`);
console.log(`4. 检查并修改 ${apisDir}/index.mock.ts 中的 Mock 数据和列配置`);
console.log(`   - 列配置已使用简化格式（minWidth），无需修改 width 字段`);
console.log(`   - 根据实际业务需求修改列字段（prop、label、minWidth 等）`);
console.log(`5. 检查并修改 ${viewsDir}/modules/createForm.vue 中的表单字段`);
console.log(`6. 在路由配置中添加新页面的路由`);
console.log('');

