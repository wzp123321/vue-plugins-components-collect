/**
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
  { name: 'button', title: 'Button 按钮', category: '基础组件', hasUniapp: true, hasUniappX: true },
  { name: 'cascader', title: 'Cascader 级联选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'checkbox', title: 'Checkbox 复选框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'checkbox-group', title: 'Checkbox-group 复选框组', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'datetime-picker', title: 'Datetime-picker 日期选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'form', title: 'Form 表单', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'form-item', title: 'Form-item 表单项', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'input', title: 'Input 输入框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'picker', title: 'Picker 选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'picker-column', title: 'Picker-column 选择器列', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'radio', title: 'Radio 单选框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'radio-group', title: 'Radio-group 单选框组', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'rate', title: 'Rate 评分', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'search', title: 'Search 搜索', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'slider', title: 'Slider 滑块', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'stepper', title: 'Stepper 步进器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'switch', title: 'Switch 开关', category: '表单组件', hasUniapp: true, hasUniappX: true },
  { name: 'textarea', title: 'Textarea 文本域', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'upload', title: 'Upload 上传', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'select', title: 'Select 选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'esign', title: 'Esign 电子签名', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'avatar', title: 'Avatar 头像', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'avatar-group', title: 'Avatar-group 头像组', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'badge', title: 'Badge 徽标', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'card', title: 'Card 卡片', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'empty', title: 'Empty 空状态', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'list', title: 'List 列表', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'list-item', title: 'List-item 列表项', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'progress', title: 'Progress 进度条', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'steps', title: 'Steps 步骤条', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'steps-item', title: 'Steps-item 步骤条项', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'tag', title: 'Tag 标签', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'action-sheet', title: 'Action-sheet 动作面板', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'dialog', title: 'Dialog 弹窗', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'loading', title: 'Loading 加载', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'message', title: 'Message 消息提示', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'modal', title: 'Modal 模态框', category: '反馈组件', hasUniapp: false, hasUniappX: true },
  { name: 'overlay', title: 'Overlay 遮罩层', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'popover', title: 'Popover 气泡弹出框', category: '反馈组件', hasUniapp: true, hasUniappX: false },
  { name: 'popup', title: 'Popup 弹出层', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'toast', title: 'Toast 轻提示', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabbar', title: 'Tabbar 底部导航栏', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabbar-item', title: 'Tabbar-item 底部导航栏项', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabs', title: 'Tabs 标签页', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'fab-button', title: 'Fab-button 浮动按钮', category: '其他组件', hasUniapp: true, hasUniappX: true },
  { name: 'pull-refresh', title: 'Pull-refresh 下拉刷新', category: '其他组件', hasUniapp: true, hasUniappX: true },
  { name: 'sidebar', title: 'Sidebar 侧边栏', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'breadcrumb', title: 'Breadcrumb 面包屑', category: '其他组件', hasUniapp: true, hasUniappX: false },

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
