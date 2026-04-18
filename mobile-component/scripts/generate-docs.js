const fs = require('fs');
const path = require('path');

// 组件配置映射（包含分类和中文名称）
const componentConfigMap = {
  基础组件: {
    button: '按钮',
    icon: '图标',
    image: '图片',
    text: '文本',
    transition: '动画',
  },
  表单组件: {
    calendar: '日历',
    checkbox: '复选框',
    'checkbox-group': '复选框组',
    'datetime-picker': '日期选择器',
    form: '表单',
    'form-item': '表单项',
    input: '输入框',
    'number-box': '数字输入框',
    picker: '选择器',
    'picker-column': '选择器列',
    radio: '单选框',
    'radio-group': '单选框组',
    rate: '评分',
    search: '搜索',
    slider: '滑块',
    switch: '开关',
    textarea: '文本域',
    upload: '上传',
  },
  数据展示: {
    avatar: '头像',
    'avatar-group': '头像组',
    badge: '徽标',
    card: '卡片',
    cell: '单元格',
    'cell-group': '单元格组',
    collapse: '折叠面板',
    'collapse-item': '折叠面板项',
    'count-down': '倒计时',
    divider: '分割线',
    empty: '空状态',
    grid: '宫格',
    'grid-item': '宫格项',
    'index-anchor': '索引锚点',
    'index-item': '索引项',
    'index-list': '索引列表',
    list: '列表',
    'list-item': '列表项',
    steps: '步骤条',
    'steps-item': '步骤条项',
    tag: '标签',
  },
  反馈组件: {
    'action-sheet': '动作面板',
    dialog: '弹窗',
    'loading-icon': '加载图标',
    'loading-page': '加载页',
    message: '消息提示',
    modal: '模态框',
    notify: '通知',
    overlay: '遮罩层',
    popover: '气泡弹出框',
    popup: '弹出层',
    toast: '轻提示',
  },
  导航组件: {
    navbar: '导航栏',
    'navbar-mini': '小程序导航栏',
    tabbar: '底部导航栏',
    'tabbar-item': '底部导航栏项',
    tabs: '标签页',
    'tabs-item': '标签页项',
  },
  布局组件: {
    gap: '间隔槽',
    'safe-bottom': '底部安全区',
    'status-bar': '状态栏',
    sticky: '吸顶容器',
  },
  其他组件: {
    'back-top': '返回顶部',
    'circle-progress': '圆形进度条',
    'column-notice': '垂直通知',
    'line-progress': '线形进度条',
    loadmore: '加载更多',
    'notice-bar': '通知栏',
    'row-notice': '水平通知',
    segmented: '分段器',
    imageviewer: '图片预览',
    stepper: '步进器',
  },
};

// 获取项目根目录
const rootDir = process.cwd();
// 组件目录路径
const componentsDir = path.join(rootDir, 'packages', 'components', 'ui', 'components');
// 文档目录路径
const docsDir = path.join(rootDir, 'apps', 'docs', 'components');
// 模板路径
const templatePath = path.join(docsDir, 'template.tpl');
// VitePress 配置文件路径
const vitepressConfigPath = path.join(rootDir, 'apps', 'docs', '.vitepress', 'config.mjs');
// 组件配置文件路径
const componentsConfigPath = path.join(rootDir, 'apps', 'docs', '.vitepress', 'components.config.ts');

// 读取模板
const template = fs.readFileSync(templatePath, 'utf8');

// 获取命令行参数，支持指定组件名
const componentName = process.argv[2];

// 读取组件目录
let components = fs.readdirSync(componentsDir);

// 过滤出在 componentConfigMap 中定义且实际存在的组件
const validComponents = [];
for (const category in componentConfigMap) {
  for (const compName in componentConfigMap[category]) {
    const fullComponentName = `tsm-${compName}`;
    const componentPath = path.join(componentsDir, fullComponentName);
    if (fs.existsSync(componentPath) && fs.statSync(componentPath).isDirectory()) {
      validComponents.push(fullComponentName);
    }
  }
}
components = validComponents;

// 如果指定了组件名，只处理该组件
if (componentName) {
  if (components.includes(componentName)) {
    components = [componentName];
  } else {
    console.error(`错误：组件 ${componentName} 不存在或未在配置中定义`);
    process.exit(1);
  }
}

// 遍历组件
components.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  
  const uniappPath = path.join(componentPath, 'uniapp');
  const uniappXPath = path.join(componentPath, 'uniapp-x');

  // 检查是否存在 uniapp 目录
  if (!fs.existsSync(uniappPath)) return;

  console.log(`处理组件: ${component}`);

  // 处理 uniapp 版本
  processComponent(component, uniappPath, 'uniapp');

  // 处理 uniapp-x 版本
  if (fs.existsSync(uniappXPath)) {
    processComponent(component, uniappXPath, 'uniapp-x');
  }
});

// 更新配置文件
if (componentName) {
  // 只更新与指定组件相关的配置
  console.log(`\n更新与 ${componentName} 相关的配置...`);
  updateVitepressConfigForComponent(componentName);
  updateComponentsConfigForComponent(componentName);
} else {
  // 更新所有配置
  updateVitepressConfig();
  updateComponentsConfig();
}

function processComponent(component, componentPath, platform) {
  const propsPath = path.join(componentPath, platform === 'uniapp' ? 'props.ts' : 'props.uts');
  const vueFile = fs.readdirSync(componentPath).find(file => file.endsWith('.vue') || file.endsWith('.uvue'));
  const vuePath = vueFile ? path.join(componentPath, vueFile) : null;

  if (!fs.existsSync(propsPath)) return { props: [], api: [] };

  // 提取 props
  const propsInfo = extractProps(propsPath, platform);

  // 提取 API (from defineExpose)
  const apiInfo = vuePath ? extractAPI(vuePath) : [];

  console.log(`  ✅ 提取 ${platform} 版本的 props 和 API`);

  // 生成文档
  generateDocs(component, { props: propsInfo, api: apiInfo }, platform);

  return { props: propsInfo, api: apiInfo };
}

function extractProps(propsPath, platform) {
  const content = fs.readFileSync(propsPath, 'utf8');
  const props = [];

  // 提取 Props 接口（支持带 export 的接口）
  const propsInterfaceRegex = /(export\s+)?interface\s+\w+Props\s*{[\s\S]*?}/g;
  const match = content.match(propsInterfaceRegex);

  if (match) {
    const interfaceContent = match[0];

    // 移除接口的开始和结束部分
    const interfaceBody = interfaceContent.replace(/(export\s+)?interface\s+\w+Props\s*{/, '').replace(/}/, '');

    // 按行分割
    const lines = interfaceBody.split('\n');

    let currentComment = '';

    // 遍历每一行，提取属性和注释
    lines.forEach(line => {
      // 跳过空行
      if (line.trim() === '') {
        return;
      }

      // 匹配单行注释，如 /** 按钮类型 */
      const singleLineCommentMatch = line.match(/\/\*\*\s*(.*?)\s*\*\//);
      if (singleLineCommentMatch) {
        // 提取单行注释内容
        currentComment = singleLineCommentMatch[1].trim();
        return;
      }

      // 匹配多行注释开始
      if (line.trim().startsWith('/**')) {
        // 开始新的注释
        currentComment = '';
      } else if (line.trim().startsWith('*') && !line.trim().startsWith('*/')) {
        // 继续注释
        currentComment += line.trim().replace(/^\*/, '').trim() + ' ';
      } else if (line.trim().startsWith('*/')) {
        // 结束注释
        currentComment = currentComment.trim();
      } else {
        // 匹配属性定义（支持可选属性）
        const propMatch = line.match(/(\w+)(\?)?\s*:\s*([^;]+);/);
        if (propMatch) {
          const name = propMatch[1];
          const isOptional = !!propMatch[2]; // 检查是否有 ? 标记
          let type = propMatch[3].trim();

          // 处理类型
          if (platform === 'uniapp-x' && type === 'Record<string, string | number>') {
            type = 'object';
          } else if (type === 'CSSProperties') {
            type = 'object';
          }

          props.push({
            name,
            type,
            description: currentComment, // 使用提取的注释作为说明
            required: !isOptional, // 是否必填
          });

          // 重置注释
          currentComment = '';
        }
      }
    });
  }

  // 提取默认值
  const defaultPropsRegex = /export\s+const\s+defaultProps\s*=\s*{[\s\S]*?}/g;
  const defaultMatch = content.match(defaultPropsRegex);

  if (defaultMatch) {
    const defaultContent = defaultMatch[0];

    // 提取所有默认值对
    const defaultPairs = defaultContent.match(/\w+\s*:\s*[^,}]+/g);
    if (defaultPairs) {
      const defaultMap = {};
      defaultPairs.forEach(pair => {
        const [name, value] = pair.split(/\s*:\s*/);
        if (name && value) {
          defaultMap[name.trim()] = value.trim();
        }
      });

      // 为 props 添加默认值
      props.forEach(prop => {
        if (defaultMap[prop.name]) {
          prop.default = defaultMap[prop.name];
        }
      });
    }
  }

  return props;
}

function extractAPI(vuePath) {
  const content = fs.readFileSync(vuePath, 'utf8');
  const api = [];

  // 提取 defineExpose
  const exposeRegex = /defineExpose\(\{[\s\S]*?\}\)/g;
  const match = content.match(exposeRegex);

  if (match) {
    const exposeContent = match[0];
    // 提取方法和属性
    const itemRegex = /(\w+)\s*[:=]/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(exposeContent)) !== null) {
      api.push({ name: itemMatch[1] });
    }
  }

  return api;
}

function generateDocs(component, api, platform) {
  const componentPath = path.join(componentsDir, component);
  const uniappPath = path.join(componentPath, 'uniapp');

  // 从组件文件中提取标题和描述
  const { title, description } = extractComponentInfo(uniappPath, component);

  // 生成文档内容
  let content = template
    .replace(/\{\{ title \}\}/g, title)
    .replace(/\{\{ description \}\}/g, description)
    .replace(/\{\{ componentName \}\}/g, component);

  // 处理 Props 部分
  const propsSection = api.props
    .map(prop => {
      // 处理默认值，默认值为 '' 时展示 '-'
      let defaultValue = prop.default || '-';
      if (defaultValue === "''") {
        defaultValue = '-';
      }
      // 对于「() => ({})」这样的默认值，替换为「{}」
      if (defaultValue === '() => ({})' || defaultValue === '() => ({') {
        defaultValue = '{}';
      }

      // 对类型中的 | 符号进行转义，避免在 Markdown 表格中被当作分隔符
      const escapedType = prop.type.replace(/\|/g, '\\|');

      return `| ${prop.name} | ${prop.description || '-'} | ${escapedType} | ${prop.required ? '是' : '否'} | ${defaultValue} |`;
    })
    .join('\n');

  // 生成完整的 Props 部分
  const propsFullSection = `## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
${propsSection}

<style>
table {
  width: 100%;
  table-layout: fixed;
}
table th,
table td {
  word-break: break-all;
}
</style>`;

  // 替换模板中的 Props 部分
  content = content.replace(/## Props[\s\S]*/g, propsFullSection);

  // 处理平台支持部分
  let platformSection;
  if (platform === 'uniapp') {
    platformSection = `| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |`;
  } else if (platform === 'uniapp-x') {
    platformSection = `| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |`;
  }
  content = content.replace(/\{\{ platformSupport \}\}/g, platformSection);

  // 写入文档
  let docPath;
  if (platform === 'uniapp') {
    docPath = path.join(docsDir, 'uniapp', `${component}.md`);
  } else if (platform === 'uniapp-x') {
    docPath = path.join(docsDir, 'uniapp-x', `${component}.md`);
  }
  
  // 检查文档是否已存在
  if (fs.existsSync(docPath)) {
    console.log(`  ⏭️  跳过生成 ${platform === 'uniapp' ? 'uniapp/' : 'uniapp-x/'}${component}.md (${platform === 'uniapp' ? 'UniApp' : 'UniApp-X'})，文件已存在`);
    return;
  }
  
  fs.writeFileSync(docPath, content);

  console.log(
    `  ✅ 生成 ${platform === 'uniapp' ? 'uniapp/' : 'uniapp-x/'}${component}.md (${platform === 'uniapp' ? 'UniApp' : 'UniApp-X'})`
  );
}

function extractComponentInfo(componentPath, component) {
  // 尝试从组件的 .vue 文件中提取注释信息
  const vueFile = fs.readdirSync(componentPath).find(file => file.endsWith('.vue'));
  if (vueFile) {
    const vuePath = path.join(componentPath, vueFile);
    const content = fs.readFileSync(vuePath, 'utf8');

    // 提取注释中的标题和描述
    const titleMatch = content.match(/@title\s+(.*)/);
    const descriptionMatch = content.match(/@description\s+(.*)/);

    if (titleMatch && descriptionMatch) {
      return {
        title: titleMatch[1].trim(),
        description: descriptionMatch[1].trim(),
      };
    }
  }

  // 如果没有提取到信息，使用默认值
  const componentName = component.replace('tsm-', '');
  const title = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)} 组件`;
  const description = `${componentName} 组件的描述信息`;

  return { title, description };
}

// 更新 VitePress 配置文件中的 sidebar
function updateVitepressConfig() {
  console.log('\n更新 VitePress 配置文件中的 sidebar...');

  // 读取现有配置
  const configContent = fs.readFileSync(vitepressConfigPath, 'utf8');

  // 扫描 uniapp 和 uniapp-x 目录下的组件文档
  const uniappComponents = getComponentsInDir(path.join(docsDir, 'uniapp'));
  const uniappXComponents = getComponentsInDir(path.join(docsDir, 'uniapp-x'));

  // 将组件大 map 铺平成一个数组，按照配置顺序
  const componentOrder = [];
  for (const category in componentConfigMap) {
    for (const component in componentConfigMap[category]) {
      componentOrder.push(`tsm-${component}`);
    }
  }

  // 找到 componentOrder 中第一个在 uniappComponents 里的组件
  const firstUniappComponent = componentOrder.find(comp => uniappComponents.includes(comp)) || 'tsm-button';
  // 找到 componentOrder 中第一个在 uniappXComponents 里的组件
  const firstUniappXComponent = componentOrder.find(comp => uniappXComponents.includes(comp)) || 'tsm-button';

  // 生成导航栏配置（移除 link 属性）
  const navConfig = `      { 
        text: '组件', 
        items: [
          { text: 'UniApp', link: '/components/uniapp/${firstUniappComponent}' },
          { text: 'UniApp-X', link: '/components/uniapp-x/${firstUniappXComponent}' }
        ]
      }`;

  // 生成 sidebar 配置
  const uniappSidebar = generateSidebarConfig(uniappComponents, 'uniapp');
  const uniappXSidebar = generateSidebarConfig(uniappXComponents, 'uniapp-x');

  // 替换配置文件中的导航栏和 sidebar 部分
  let newConfigContent = configContent;

  // 替换导航栏配置（使用更精确的正则表达式）
  const navRegex = /(\s*\{\s*text:\s*'组件',[\s\S]*?items:\s*\[[\s\S]*?\]\s*\})\s*,/;
  newConfigContent = newConfigContent.replace(navRegex, navConfig + ',');

  // 替换 uniapp 的 sidebar 配置
  const uniappSidebarRegex = /\/components\/uniapp\/\': \[([\s\S]*?)\s*\],/g;
  newConfigContent = newConfigContent.replace(
    uniappSidebarRegex,
    `/components/uniapp/': [\n${uniappSidebar}\n      ],`
  );

  // 替换 uniapp-x 的 sidebar 配置
  const uniappXSidebarRegex = /\/components\/uniapp-x\/\': \[([\s\S]*?)\s*\],/g;
  newConfigContent = newConfigContent.replace(
    uniappXSidebarRegex,
    `/components/uniapp-x/': [\n${uniappXSidebar}\n      ],`
  );

  // 写入更新后的配置
  fs.writeFileSync(vitepressConfigPath, newConfigContent);

  console.log('✅ VitePress 配置文件更新完成！');
}

// 只更新指定组件的 VitePress 配置
function updateVitepressConfigForComponent(targetComponent) {
  console.log(`\n更新 VitePress 配置文件中 ${targetComponent} 的配置...`);
  
  // 读取现有配置
  const configContent = fs.readFileSync(vitepressConfigPath, 'utf8');
  
  // 获取组件信息
  const componentName = targetComponent.replace('tsm-', '');
  const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  // 查找组件所属的分类
  let targetCategory = '';
  let chineseName = '';
  for (const [category, componentsInCategory] of Object.entries(componentConfigMap)) {
    if (componentsInCategory[componentName]) {
      targetCategory = category;
      chineseName = componentsInCategory[componentName];
      break;
    }
  }
  
  if (!targetCategory) {
    console.log(`  ⚠️  组件 ${targetComponent} 未在配置中找到，跳过更新`);
    return;
  }
  
  // 生成组件配置项
  const uniappItem = `            { text: '${displayName} ${chineseName}', link: '/components/uniapp/${targetComponent}' },`;
  const uniappXItem = `            { text: '${displayName} ${chineseName}', link: '/components/uniapp-x/${targetComponent}' },`;
  
  let newConfigContent = configContent;
  
  // 更新 uniapp 配置
  // 查找分类的正则表达式
  const uniappCategoryRegex = new RegExp(`(text: '${targetCategory}',[\\s\\S]*?items: \\[)([\\s\\S]*?)(\\])`);
  const uniappMatch = newConfigContent.match(uniappCategoryRegex);
  
  if (uniappMatch) {
    const categoryContent = uniappMatch[2];
    // 检查组件是否已存在
    const componentRegex = new RegExp(`\\{ text: '${displayName} ${chineseName}', link: '/components/uniapp/${targetComponent}' \\},?`);
    
    if (componentRegex.test(categoryContent)) {
      // 组件已存在，不需要更新
      console.log(`  ⏭️  uniapp/${targetComponent} 已存在，跳过`);
    } else {
      // 组件不存在，添加它
      // 找到合适的位置插入（按字母顺序）
      const newCategoryContent = categoryContent + uniappItem + '\n';
      newConfigContent = newConfigContent.replace(uniappMatch[0], uniappMatch[1] + newCategoryContent + uniappMatch[3]);
      console.log(`  ✅ 添加 uniapp/${targetComponent} 到配置`);
    }
  }
  
  // 更新 uniapp-x 配置
  const uniappXCategoryRegex = new RegExp(`(text: '${targetCategory}',[\\s\\S]*?items: \\[)([\\s\\S]*?)(\\])`);
  // 在 uniapp-x 部分查找
  const uniappXSectionRegex = /\/components\/uniapp-x\/': \[([\s\S]*?)\],/;
  const uniappXSectionMatch = newConfigContent.match(uniappXSectionRegex);
  
  if (uniappXSectionMatch) {
    const uniappXSection = uniappXSectionMatch[1];
    // 在 uniapp-x 部分查找目标分类
    const categoryInUniappXRegex = new RegExp(`(text: '${targetCategory}',[\\s\\S]*?items: \\[)([\\s\\S]*?)(\\])`);
    const categoryMatch = uniappXSection.match(categoryInUniappXRegex);
    
    if (categoryMatch) {
      const categoryContent = categoryMatch[2];
      const componentRegex = new RegExp(`\\{ text: '${displayName} ${chineseName}', link: '/components/uniapp-x/${targetComponent}' \\},?`);
      
      if (componentRegex.test(categoryContent)) {
        console.log(`  ⏭️  uniapp-x/${targetComponent} 已存在，跳过`);
      } else {
        const newCategoryContent = categoryContent + uniappXItem + '\n';
        const newUniappXSection = uniappXSection.replace(categoryMatch[0], categoryMatch[1] + newCategoryContent + categoryMatch[3]);
        newConfigContent = newConfigContent.replace(uniappXSectionMatch[0], uniappXSectionMatch[0].replace(uniappXSection, newUniappXSection));
        console.log(`  ✅ 添加 uniapp-x/${targetComponent} 到配置`);
      }
    }
  }
  
  // 写入更新后的配置
  fs.writeFileSync(vitepressConfigPath, newConfigContent);
  
  console.log(`✅ VitePress 配置文件更新完成！`);
}

// 获取目录下的组件列表
function getComponentsInDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  // 获取所有在 componentConfigMap 中定义且实际存在的组件
  const definedComponents = [];
  for (const category in componentConfigMap) {
    for (const compName in componentConfigMap[category]) {
      const fullComponentName = `tsm-${compName}`;
      const componentPath = path.join(componentsDir, fullComponentName);
      // 只添加实际存在的组件
      if (fs.existsSync(componentPath) && fs.statSync(componentPath).isDirectory()) {
        definedComponents.push(fullComponentName);
      }
    }
  }
  
  // 只返回在 componentConfigMap 中定义、实际存在且文档文件存在的组件
  return fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''))
    .filter(component => definedComponents.includes(component));
}

// 生成 sidebar 配置
function generateSidebarConfig(components, platform) {
  let sidebarConfig = '';

  // 按固定顺序处理分类
  Object.entries(componentConfigMap).forEach(([category, componentsInCategory]) => {
    // 筛选出当前平台下存在的组件
    const existingComponents = Object.keys(componentsInCategory)
      .map(componentName => `tsm-${componentName}`)
      .filter(component => components.includes(component));

    // 如果该分类下没有组件，跳过
    if (existingComponents.length === 0) {
      return;
    }

    sidebarConfig += `        {
          text: '${category}',
          items: [
`;

    existingComponents.forEach(component => {
      // 提取组件名称（去掉 tsm- 前缀）
      const componentName = component.replace('tsm-', '');
      // 首字母大写
      const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      // 获取中文名称
      const chineseName = componentConfigMap[category][componentName];

      sidebarConfig += `            { text: '${displayName} ${chineseName}', link: '/components/${platform}/${component}' },
`;
    });

    sidebarConfig += `          ]
        },
`;
  });

  return sidebarConfig;
}

// 获取组件的显示名称
function getComponentDisplayName(component) {
  // 提取组件名称（去掉 tsm- 前缀）
  const componentName = component.replace('tsm-', '');

  // 遍历所有分类，查找组件的中文名称
  for (const [category, componentsInCategory] of Object.entries(componentConfigMap)) {
    if (componentsInCategory[componentName]) {
      return componentsInCategory[componentName];
    }
  }

  return '';
}

// 生成 components.config.ts 文件
function updateComponentsConfig() {
  console.log('\n生成 components.config.ts 文件...');

  // 读取组件目录
  const components = fs.readdirSync(componentsDir).filter(item => {
    const itemPath = path.join(componentsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  let componentsConfig = '';

  // 遍历所有分类和组件
  Object.entries(componentConfigMap).forEach(([category, componentsInCategory]) => {
    Object.entries(componentsInCategory).forEach(([componentName, chineseName]) => {
      const component = `tsm-${componentName}`;

      // 检查组件是否存在
      if (!components.includes(component)) return;

      // 检查是否有 uniapp 版本
      const hasUniapp = fs.existsSync(path.join(componentsDir, component, 'uniapp'));
      // 检查是否有 uniapp-x 版本
      const hasUniappX = fs.existsSync(path.join(componentsDir, component, 'uniapp-x'));

      // 首字母大写
      const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

      componentsConfig += `  { name: '${componentName}', title: '${displayName} ${chineseName}', category: '${category}', hasUniapp: ${hasUniapp}, hasUniappX: ${hasUniappX} },\n`;
    });
  });

  // 生成完整的 components.config.ts 内容
  const configContent = `/**
 * 组件配置文件
 * 用于文档和playground的组件管理
 */

export interface ComponentConfig {
  name: string;
  title: string;
  category: string;
  hasUniapp: boolean;
  hasUniappX: boolean;
}

export const components: ComponentConfig[] = [
${componentsConfig}
];

export const categories = [
  '基础组件',
  '表单组件',
  '数据展示',
  '反馈组件',
  '导航组件',
  '布局组件',
  '其他组件'
];

export function getComponentsByCategory(category: string): ComponentConfig[] {
  return components.filter(c => c.category === category);
}

export function getComponentByName(name: string): ComponentConfig | undefined {
  return components.find(c => c.name === name);
}
`;

  // 写入文件
  fs.writeFileSync(componentsConfigPath, configContent);

  console.log('✅ components.config.ts 文件生成完成！');
}

// 只更新指定组件的 components.config.ts 配置
function updateComponentsConfigForComponent(targetComponent) {
  console.log(`\n更新 components.config.ts 中 ${targetComponent} 的配置...`);
  
  // 读取现有配置
  if (!fs.existsSync(componentsConfigPath)) {
    console.log('  ⚠️  components.config.ts 不存在，跳过更新');
    return;
  }
  
  const configContent = fs.readFileSync(componentsConfigPath, 'utf8');
  
  // 获取组件信息
  const componentName = targetComponent.replace('tsm-', '');
  
  // 查找组件所属的分类
  let targetCategory = '';
  let chineseName = '';
  for (const [category, componentsInCategory] of Object.entries(componentConfigMap)) {
    if (componentsInCategory[componentName]) {
      targetCategory = category;
      chineseName = componentsInCategory[componentName];
      break;
    }
  }
  
  if (!targetCategory) {
    console.log(`  ⚠️  组件 ${targetComponent} 未在配置中找到，跳过更新`);
    return;
  }
  
  // 检查组件是否实际存在
  const componentPath = path.join(componentsDir, targetComponent);
  if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
    console.log(`  ⚠️  组件 ${targetComponent} 不存在于组件目录中，跳过更新`);
    return;
  }
  
  // 检查是否有 uniapp 版本
  const hasUniapp = fs.existsSync(path.join(componentsDir, targetComponent, 'uniapp'));
  // 检查是否有 uniapp-x 版本
  const hasUniappX = fs.existsSync(path.join(componentsDir, targetComponent, 'uniapp-x'));
  
  // 首字母大写
  const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  // 生成新的组件配置项
  const newComponentConfig = `  { name: '${componentName}', title: '${displayName} ${chineseName}', category: '${targetCategory}', hasUniapp: ${hasUniapp}, hasUniappX: ${hasUniappX} },`;
  
  // 检查组件是否已存在
  const componentRegex = new RegExp(`\\{ name: '${componentName}', title: '[^']+', category: '[^']+', hasUniapp: [^,]+, hasUniappX: [^}]+ \\},?`);
  
  let newConfigContent = configContent;
  
  if (componentRegex.test(configContent)) {
    // 组件已存在，更新它（保持原有缩进）
    const existingMatch = configContent.match(componentRegex);
    if (existingMatch) {
      // 获取原有的缩进
      const existingLine = existingMatch[0];
      const indentMatch = existingLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '  ';
      const formattedConfig = indent + newComponentConfig.trim();
      newConfigContent = configContent.replace(componentRegex, formattedConfig);
      console.log(`  ✅ 更新 ${targetComponent} 的配置`);
    }
  } else {
    // 组件不存在，添加它
    // 在 components 数组中找到合适的位置插入
    const arrayEndRegex = /(export const components: ComponentConfig\[\] = \[[\s\S]*?)(\];)/;
    const match = configContent.match(arrayEndRegex);
    
    if (match) {
      // 在数组末尾添加，保持2空格缩进
      newConfigContent = configContent.replace(arrayEndRegex, `$1  ${newComponentConfig}\n$2`);
      console.log(`  ✅ 添加 ${targetComponent} 到配置`);
    }
  }
  
  // 写入更新后的配置
  fs.writeFileSync(componentsConfigPath, newConfigContent);
  
  console.log(`✅ components.config.ts 更新完成！`);
}

console.log('\n处理完成！');
