import { existsSync, accessSync, constants } from 'fs';
import { resolve, join } from 'node:path';
import {
  projectRoot,
  normalizeToCamel,
  validateModuleName,
  showNameConfirmation,
  getRelativePath,
} from './utils.js';

import {
  createQuestionInterface,
  askQuestion,
  askYesNo,
  selectDirectory,
  askInteractionType,
  askSearchFields,
  askTableConfig,
  askOtherFeatures,
  askFormFields,
  askTemplateSelection,
  askSaveTemplate,
} from './interactive.js';
import {
  detectProjectStructure,
  displayDetectedDirectories,
} from './project-detector.js';
import { createApiFiles } from './generate-api.js';
import { createViewFiles } from './generate-view.js';
import { updateRoutes } from './generate-route.js';
// 已移除依赖检查功能
// import {
//   checkDependencies,
//   displayDependencyCheck,
// } from './dependency-checker.js';
import { loadTemplate } from './template-manager.js';

const srcPath = resolve(projectRoot, 'src');

/**
 * 获取页面类型的中文标签
 * @param {string|null} pageType - 页面类型 ('dialog'|'drawer'|'page'|null)
 * @returns {string} 中文标签
 */
function getPageTypeLabel(pageType) {
  if (!pageType) return '';
  const labels = {
    dialog: '弹窗',
    drawer: '抽屉',
    page: '单独页面',
  };
  return labels[pageType] || '未知';
}

/**
 * 检查目录是否存在且可写
 * @param {string} dirPath - 目录路径
 * @returns {boolean} 是否可写
 */
function isDirectoryWritable(dirPath) {
  try {
    if (!existsSync(dirPath)) {
      return false;
    }
    accessSync(dirPath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查API目录是否已存在同名模块
 * @param {string} apisDir - APIs目录路径
 * @param {string} moduleName - 模块名称
 * @returns {boolean} 是否已存在
 */
function checkApiModuleExists(apisDir, moduleName) {
  if (!apisDir) return false;
  const apiModuleDir = join(apisDir, moduleName);
  return existsSync(apiModuleDir);
}

/**
 * 检查路由文件是否已存在
 * @param {string} routerDir - 路由目录路径
 * @param {string} moduleName - 模块名称
 * @returns {boolean} 是否已存在
 */
function checkRouteFileExists(routerDir, moduleName) {
  if (!routerDir) return false;
  const routeFile = join(routerDir, 'modules', `${moduleName}.ts`);
  return existsSync(routeFile);
}

/**
 * 显示配置总结并确认
 * @param {Object} rl - 问答接口对象
 * @param {Object} config - 配置对象
 * @returns {Promise<boolean>} 用户是否确认
 */
async function showConfigSummary(rl, config) {
  const {
    moduleName,
    moduleTitle,
    needApi,
    needMock,
    pageConfig,
    needDelete,
    searchFields,
    tableConfig,
    otherFeatures,
    formFields,
    apisDir,
    routerDir,
  } = config;

  console.log(`\n${'='.repeat(50)}`);
  console.log('📋 配置总结');
  console.log(`${'='.repeat(50)}\n`);

  console.log(`📦 模块信息:`);
  console.log(`   名称: ${moduleName}`);
  console.log(`   标题: ${moduleTitle}\n`);

  if (needApi) {
    console.log(`🔌 接口配置:`);
    console.log(`   ✅ 已启用接口请求功能`);
    if (needMock) {
      console.log(`   ✅ 将生成 Mock 数据文件`);
    }
    if (apisDir) {
      const relativeApiPath = getRelativePath(apisDir);
      console.log(`   目录: ${relativeApiPath}`);
      if (checkApiModuleExists(apisDir, moduleName)) {
        console.log(`   ⚠️  警告: API模块目录已存在，将被覆盖`);
      }
    }
    console.log('');
  }

  console.log(`📄 页面配置:`);
  const pages = [];
  if (pageConfig.add) {
    pages.push(`   新增: ${getPageTypeLabel(pageConfig.add)}`);
  }
  if (pageConfig.edit) {
    pages.push(`   编辑: ${getPageTypeLabel(pageConfig.edit)}`);
  }
  if (pageConfig.detail) {
    pages.push(`   详情: ${getPageTypeLabel(pageConfig.detail)}`);
  }
  if (pages.length === 0) {
    console.log(`   (未选择任何页面)`);
  } else {
    pages.forEach((page) => console.log(page));
  }
  console.log(`   删除功能: ${needDelete ? '✅ 已启用' : '❌ 未启用'}\n`);

  if (searchFields.length > 0) {
    console.log(`🔍 搜索条件:`);
    searchFields.forEach((field) => {
      let typeLabel = '';
      if (field.type === 'text') {
        typeLabel = '文本';
      } else if (field.type === 'dateRange') {
        typeLabel = '日期范围';
      } else if (field.type === 'select') {
        typeLabel = '下拉选择';
      }
      console.log(
        `   - ${field.label} (${field.field})${typeLabel ? ` [${typeLabel}]` : ''}`,
      );
    });
    console.log('');
  }

  console.log(`📊 表格配置:`);
  console.log(
    `   序号列: ${tableConfig.showIndexColumn ? '✅ 显示' : '❌ 隐藏'}`,
  );
  console.log(
    `   多选功能: ${tableConfig.enableSelection ? '✅ 启用' : '❌ 禁用'}`,
  );
  if (tableConfig.enableSelection) {
    console.log(
      `   批量删除: ${tableConfig.enableBatchDelete ? '✅ 启用' : '❌ 禁用'}`,
    );
  }
  console.log('');

  if (otherFeatures.enableExport || otherFeatures.enableImport) {
    console.log(`🔧 其他功能:`);
    if (otherFeatures.enableExport) {
      console.log(`   ✅ 导出功能（Excel）`);
    }
    if (otherFeatures.enableImport) {
      console.log(`   ✅ 导入功能（Excel）`);
    }
    console.log('');
  }

  if (
    formFields &&
    (formFields.add?.length > 0 || formFields.edit?.length > 0)
  ) {
    console.log(`📝 表单字段配置:`);
    if (formFields.add?.length > 0) {
      console.log(`   新增表单: ${formFields.add.length} 个字段`);
      formFields.add.forEach((field) => {
        console.log(
          `     - ${field.label} (${field.field}) [${field.type}${field.required ? ', 必填' : ''}]`,
        );
      });
    }
    if (formFields.edit?.length > 0) {
      console.log(`   编辑表单: ${formFields.edit.length} 个字段`);
      formFields.edit.forEach((field) => {
        console.log(
          `     - ${field.label} (${field.field}) [${field.type}${field.required ? ', 必填' : ''}]`,
        );
      });
    }
    console.log('');
  }

  if (routerDir) {
    console.log(`🛣️  路由配置:`);
    const relativeRouterPath = getRelativePath(routerDir);
    console.log(`   目录: ${relativeRouterPath}`);
    if (checkRouteFileExists(routerDir, moduleName)) {
      console.log(`   ⚠️  警告: 路由文件已存在，将被覆盖`);
    }
    console.log('');
  }

  console.log(`${'='.repeat(50)}\n`);

  return askYesNo(rl, '确认以上配置，开始生成模块？');
}

/**
 * 主函数 - 交互式流程
 */
export async function generateModule() {
  const rl = createQuestionInterface();

  try {
    // 1. 欢迎提示
    console.log(`\n${'='.repeat(50)}`);
    console.log('🚀 Vue3快速开发模板生成工具');
    console.log(`${'='.repeat(50)}\n`);

    // 1.5. 询问是否使用模板
    const templateSelection = await askTemplateSelection(rl);
    let loadedConfig = null;

    if (templateSelection.useTemplate) {
      loadedConfig = loadTemplate(templateSelection.templateName);
      if (loadedConfig) {
        console.log(`✅ 已加载模板: ${templateSelection.templateName}`);
        console.log('📋 模板配置预览:');
        console.log(`   模块名称: ${loadedConfig.moduleName || '需输入'}`);
        console.log(`   模块标题: ${loadedConfig.moduleTitle || '需输入'}`);
        console.log(`   接口功能: ${loadedConfig.needApi ? '✅' : '❌'}`);
        console.log(`   Mock数据: ${loadedConfig.needMock ? '✅' : '❌'}`);
        const confirmUse = await askYesNo(rl, '是否使用此模板配置？');
        if (!confirmUse) {
          loadedConfig = null;
          console.log('✅ 将手动配置\n');
        }
      } else {
        console.log('❌ 加载模板失败，将手动配置\n');
        loadedConfig = null;
      }
    }

    // 2. 询问模块名称（带验证和确认）
    console.log('\n💡 命名规范提示:');
    console.log('   - 必须使用驼峰命名（首字母小写）');
    console.log('   - 只能包含字母和数字');
    console.log('   - 必须以字母开头');
    console.log('   - 长度建议2-50个字符');
    console.log('   - 示例: userManage, phoneBox, goodsList\n');

    let moduleNameInput;
    let moduleName;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      moduleNameInput = await askQuestion(
        rl,
        '请输入业务模块名称（驼峰命名，如userManage、phoneBox）: ',
        validateModuleName,
      );

      // 标准化模块名称（确保首字母小写）
      moduleName = normalizeToCamel(moduleNameInput);

      // 显示确认信息
      showNameConfirmation(moduleNameInput, moduleName);

      // 如果名称没有变化，直接使用
      if (moduleNameInput === moduleName) {
        break;
      }

      // 确认是否使用标准化后的名称
      // eslint-disable-next-line no-await-in-loop
      const confirm = await askYesNo(
        rl,
        `是否使用标准化后的名称 "${moduleName}"？`,
      );
      if (confirm) {
        break;
      }
      console.log('');
    }

    const moduleTitle =
      (await rl.question('请输入模块标题（可选，直接回车使用模块名称）: ')) ||
      moduleNameInput;

    // 检查视图目录是否已存在
    const viewDirCheck = resolve(srcPath, 'views', moduleName);
    if (existsSync(viewDirCheck)) {
      console.error(`\n❌ 模块 ${moduleName} 已存在，请使用其他名称`);
      console.error(
        `   已存在的目录: ${getRelativePath(viewDirCheck)}`,
      );
      rl.close();
      process.exit(1);
    }

    // 3. 路由配置将在页面配置后自动确定

    // 4. 询问是否需要接口请求功能（如果模板中有配置则使用模板）
    let needApi = loadedConfig?.needApi;
    let needMock = loadedConfig?.needMock || false;
    if (needApi === undefined) {
      needApi = await askYesNo(rl, '是否需要接口请求功能？');
      if (needApi) {
        console.log('✅ 已集成Axios接口请求封装');
        // 询问是否需要 Mock 数据
        needMock = await askYesNo(
          rl,
          '是否需要生成本地 Mock 数据（用于后端接口未完成时的前端开发）？',
        );
        if (needMock) {
          console.log(
            '✅ 将生成 Mock 数据文件，可在后端接口开发完成后轻松删除',
          );
        }
      }
    } else {
      console.log(`✅ 接口功能: ${needApi ? '已启用' : '已禁用'} (来自模板)`);
      if (needMock) {
        console.log('✅ Mock数据: 已启用 (来自模板)');
      }
    }

    // 5. 分别询问每个页面及其交互形式（如果模板中有配置则使用模板）
    const pageConfig = loadedConfig?.pageConfig || {
      add: null,
      edit: null,
      detail: null,
    };
    const formFields = loadedConfig?.formFields || { add: [], edit: [] };

    if (!loadedConfig?.pageConfig) {
      // 询问新增页面
      const needAdd = await askYesNo(rl, '是否需要新增页面？');
      if (needAdd) {
        const addType = await askInteractionType(rl, '新增');
        pageConfig.add = addType;
        // 如果新增页面是表单形式，不询问字段配置，使用空数组
        if (
          addType === 'dialog' ||
          addType === 'drawer' ||
          addType === 'page'
        ) {
          // 不再询问是否配置字段，默认不配置
          formFields.add = [];
        }
      }

      // 询问编辑页面
      const needEdit = await askYesNo(rl, '是否需要编辑页面？');
      if (needEdit) {
        const editType = await askInteractionType(rl, '编辑');
        pageConfig.edit = editType;
        // 如果编辑页面是表单形式，不询问字段配置，使用空数组
        if (
          editType === 'dialog' ||
          editType === 'drawer' ||
          editType === 'page'
        ) {
          // 不再询问是否配置字段，默认不配置
          formFields.edit = [];
        }
      }

      // 询问详情页面
      const needDetail = await askYesNo(rl, '是否需要详情页面？');
      if (needDetail) {
        const detailType = await askInteractionType(rl, '详情');
        pageConfig.detail = detailType;
      }
    } else {
      console.log('✅ 页面配置已从模板加载');
      const hasAdd = pageConfig.add !== null;
      const hasEdit = pageConfig.edit !== null;
      if (hasAdd || hasEdit) {
        // 即使使用模板，也不再询问是否配置字段，默认不配置
        if (
          hasAdd &&
          (pageConfig.add === 'dialog' ||
            pageConfig.add === 'drawer' ||
            pageConfig.add === 'page')
        ) {
          formFields.add = [];
        }
        if (
          hasEdit &&
          (pageConfig.edit === 'dialog' ||
            pageConfig.edit === 'drawer' ||
            pageConfig.edit === 'page')
        ) {
          formFields.edit = [];
        }
      }
    }

    // 询问是否需要删除功能（如果模板中有配置则使用模板）
    let needDelete = loadedConfig?.needDelete;
    if (needDelete === undefined) {
      needDelete = await askYesNo(rl, '是否需要删除功能？');
      if (needDelete) {
        console.log('✅ 将在表格操作列中添加删除按钮');
      }
    } else {
      console.log(
        `✅ 删除功能: ${needDelete ? '已启用' : '已禁用'} (来自模板)`,
      );
    }

    // 询问是否需要更多搜索条件（如果模板中有配置则使用模板）
    let searchFields = loadedConfig?.searchFields || [];
    if (!loadedConfig?.searchFields) {
      const needMoreSearch = await askYesNo(
        rl,
        '是否需要更多搜索条件（除了关键字搜索外）？',
      );
      if (needMoreSearch) {
        // 不再询问是否使用增强搜索，直接使用普通搜索
        searchFields = await askSearchFields(rl);
        if (searchFields.length > 0) {
          console.log(
            `\n✅ 已配置 ${searchFields.length} 个搜索条件: ${searchFields.map((s) => `${s.label}(${s.field})`).join(', ')}\n`,
          );
        }
      }
    } else {
      console.log(`✅ 搜索条件: 已从模板加载 (${searchFields.length}个)`);
    }

    // 询问表格配置（如果模板中有配置则使用模板）
    let tableConfig = loadedConfig?.tableConfig;
    if (!tableConfig) {
      tableConfig = await askTableConfig(rl);
    } else {
      console.log('✅ 表格配置已从模板加载');
    }

    // 询问其他功能配置（如果模板中有配置则使用模板）
    let otherFeatures = loadedConfig?.otherFeatures;
    if (!otherFeatures) {
      otherFeatures = await askOtherFeatures(rl);
    } else {
      console.log('✅ 其他功能配置已从模板加载');
    }

    // 统计需要生成页面的情况
    const hasPages = pageConfig.add || pageConfig.edit || pageConfig.detail;
    // 路由始终需要创建列表路由；如有单独页面则生成子路由
    const needRouter = true;

    // 6. 检测项目结构
    const projectStructure = detectProjectStructure();
    displayDetectedDirectories(projectStructure);

    // 7. 选择或确定目录
    let apisDir = null;
    let routerDir = null;

    if (needApi) {
      if (projectStructure.apis.length > 0) {
        apisDir = await selectDirectory(rl, projectStructure.apis, 'apis');
      } else {
        // 使用默认路径
        apisDir = resolve(srcPath, 'apis');
        console.log(
          `⚠️  使用默认 apis 目录: ${getRelativePath(apisDir)}\n`,
        );
      }

      // 验证API目录是否可写
      if (apisDir && !isDirectoryWritable(apisDir)) {
        console.error(
          `\n❌ API目录不可写: ${getRelativePath(apisDir)}`,
        );
        rl.close();
        process.exit(1);
      }

      // 检查API模块是否已存在
      if (checkApiModuleExists(apisDir, moduleName)) {
        const overwrite = await askYesNo(
          rl,
          `⚠️  API模块 ${moduleName} 已存在，是否覆盖？`,
        );
        if (!overwrite) {
          console.log('\n❌ 已取消生成');
          rl.close();
          process.exit(0);
        }
        console.log('✅ 将覆盖已存在的API模块\n');
      }
    }

    // 路由目录（始终生成列表路由，若存在单独页面则附加子路由）
    if (needRouter) {
      if (projectStructure.router.length > 0) {
        routerDir = await selectDirectory(
          rl,
          projectStructure.router,
          'router',
        );
      } else {
        // 使用默认路径
        routerDir = resolve(srcPath, 'router');
        console.log(
          `⚠️  使用默认 router 目录: ${getRelativePath(routerDir)}\n`,
        );
      }

      // 验证路由目录是否可写
      if (routerDir && !isDirectoryWritable(routerDir)) {
        console.error(
          `\n❌ 路由目录不可写: ${getRelativePath(routerDir)}`,
        );
        rl.close();
        process.exit(1);
      }

      // 检查路由文件是否已存在
      if (checkRouteFileExists(routerDir, moduleName)) {
        const overwrite = await askYesNo(
          rl,
          `⚠️  路由文件 ${moduleName}.ts 已存在，是否覆盖？`,
        );
        if (!overwrite) {
          console.log('\n❌ 已取消生成');
          rl.close();
          process.exit(0);
        }
        console.log('✅ 将覆盖已存在的路由文件\n');
      }
    }

    // 8. 显示配置总结并确认
    const configSummary = {
      moduleName,
      moduleTitle,
      needApi,
      needMock,
      pageConfig,
      needDelete,
      searchFields,
      tableConfig,
      otherFeatures,
      formFields,
      apisDir,
      routerDir,
    };

    const confirmed = await showConfigSummary(rl, configSummary);
    if (!confirmed) {
      console.log('\n❌ 已取消生成');
      rl.close();
      process.exit(0);
    }

    // 已移除依赖检查功能

    console.log(`\n${'='.repeat(50)}`);
    console.log('📁 开始生成模块文件结构...');
    console.log(`${'='.repeat(50)}\n`);

    // 9. 创建目录结构和文件
    const viewDir = resolve(srcPath, 'views', moduleName);

    try {
      // 创建API文件
      if (needApi && apisDir) {
        console.log('📝 正在创建API文件...');
        createApiFiles(apisDir, moduleName, moduleTitle, needMock);
        console.log('✅ API文件创建完成\n');
      }

      // 创建视图文件（至少创建index页面）
      console.log('📝 正在创建视图文件...');
      createViewFiles(
        viewDir,
        moduleName,
        moduleTitle,
        pageConfig,
        needDelete,
        searchFields,
        tableConfig,
        otherFeatures,
        formFields,
      );
      console.log('✅ 视图文件创建完成\n');

      // 10. 更新路由配置（只对单独页面创建路由）
      if (needRouter && routerDir) {
        console.log('📝 正在更新路由配置...');
        await updateRoutes(routerDir, moduleName, moduleTitle, pageConfig);
        console.log('✅ 路由配置更新完成\n');
      }
    } catch (error) {
      console.error('\n❌ 生成文件时出错:', error.message);
      console.error('   错误详情:', error);
      rl.close();
      process.exit(1);
    }

    // 11. 完成提示
    console.log(`\n${'='.repeat(50)}`);
    console.log('✨ 模块创建完成，可开始开发！');
    console.log('='.repeat(50));
    console.log('\n📝 生成的文件结构:');

    if (needApi && apisDir) {
      const apiDir = join(apisDir, moduleName);
      const relativeApiPath = apiDir.replace(`${projectRoot}/`, '');
      console.log(`   ${relativeApiPath}/`);
      console.log(`     ├── index.api.ts`);
      console.log(`     └── index.ts`);
      if (needMock) {
        console.log(`     └── index.mock.ts (Mock数据文件)`);
        console.log(`\n💡 Mock 数据使用提示:`);
        console.log(
          `   1. 在 index.ts 中设置 USE_MOCK_DATA = true 启用 Mock 数据`,
        );
        console.log(
          `   2. 后端接口开发完成后，设置 USE_MOCK_DATA = false 切换到真实接口`,
        );
        console.log(
          `   3. 完全删除 Mock 数据：删除 index.mock.ts 和相关导入即可`,
        );
      }
    }

    // 显示视图文件结构
    console.log(`   src/views/${moduleName}/`);
    console.log(`     └── index.vue`);
    if (hasPages) {
      console.log(`     └── modules/`);
      if (pageConfig.add) {
        const addTypeLabel = getPageTypeLabel(pageConfig.add);
        if (pageConfig.add === 'page') {
          console.log(`         └── add.vue (${addTypeLabel})`);
        } else {
          console.log(`         └── addForm.vue (${addTypeLabel})`);
        }
      }
      if (pageConfig.edit) {
        const editTypeLabel = getPageTypeLabel(pageConfig.edit);
        if (pageConfig.edit === 'page') {
          console.log(`         └── edit.vue (${editTypeLabel})`);
        } else {
          console.log(`         └── editForm.vue (${editTypeLabel})`);
        }
      }
      if (pageConfig.detail) {
        const detailTypeLabel = getPageTypeLabel(pageConfig.detail);
        console.log(`         └── detail.vue (${detailTypeLabel})`);
      }
    } else {
      console.log(`     (未选择任何页面)`);
    }

    // 显示路由文件结构
    if (needRouter && routerDir) {
      const routerModulesDir = join(routerDir, 'modules');
      const relativeRouterPath = routerModulesDir.replace(
        `${projectRoot}/`,
        '',
      );
      console.log(`   ${relativeRouterPath}/`);
      console.log(`     └── ${moduleName}.ts (路由文件)`);
      console.log(
        `   💡 提示: 项目使用 import.meta.glob 自动导入路由，无需手动配置`,
      );
    }

    console.log('\n💡 下一步操作:');
    console.log('   1. 检查生成的文件是否符合预期');
    console.log('   2. 根据实际需求修改API接口路径和参数');
    console.log('   3. 完善表单字段和验证规则');
    console.log('   4. 调整页面样式和布局');
    console.log('');

    // 询问是否保存为模板
    const finalConfig = {
      moduleName,
      moduleTitle,
      needApi,
      needMock,
      pageConfig,
      needDelete,
      searchFields,
      tableConfig,
      otherFeatures,
      formFields,
    };
    await askSaveTemplate(rl, finalConfig);
  } catch (error) {
    console.error('\n❌ 生成模块时出错:');
    console.error('   错误信息:', error.message);
    if (error.stack) {
      console.error('   错误堆栈:', error.stack);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 如果直接运行此文件，则执行主函数（用于测试）
// 注意：在 CLI 中通过 import 调用，不会执行这里
if (import.meta.url.endsWith('index.js') && process.argv[1]?.endsWith('index.js')) {
  generateModule();
}
