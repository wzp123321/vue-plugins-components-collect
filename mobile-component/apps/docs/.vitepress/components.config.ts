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
  { name: 'image', title: 'Image 图片', category: '基础组件', hasUniapp: true, hasUniappX: true },
  { name: 'text', title: 'Text 文本', category: '基础组件', hasUniapp: true, hasUniappX: true },
  { name: 'transition', title: 'Transition 动画', category: '基础组件', hasUniapp: true, hasUniappX: true },
  { name: 'calendar', title: 'Calendar 日历', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'checkbox', title: 'Checkbox 复选框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'checkbox-group', title: 'Checkbox-group 复选框组', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'datetime-picker', title: 'Datetime-picker 日期选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'form', title: 'Form 表单', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'form-item', title: 'Form-item 表单项', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'input', title: 'Input 输入框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'number-box', title: 'Number-box 数字输入框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'picker', title: 'Picker 选择器', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'picker-column', title: 'Picker-column 选择器列', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'radio', title: 'Radio 单选框', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'radio-group', title: 'Radio-group 单选框组', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'rate', title: 'Rate 评分', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'search', title: 'Search 搜索', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'slider', title: 'Slider 滑块', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'switch', title: 'Switch 开关', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'textarea', title: 'Textarea 文本域', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'upload', title: 'Upload 上传', category: '表单组件', hasUniapp: true, hasUniappX: false },
  { name: 'avatar', title: 'Avatar 头像', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'avatar-group', title: 'Avatar-group 头像组', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'badge', title: 'Badge 徽标', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'card', title: 'Card 卡片', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'collapse', title: 'Collapse 折叠面板', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'collapse-item', title: 'Collapse-item 折叠面板项', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'divider', title: 'Divider 分割线', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'empty', title: 'Empty 空状态', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'index-anchor', title: 'Index-anchor 索引锚点', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'index-item', title: 'Index-item 索引项', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'index-list', title: 'Index-list 索引列表', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'list', title: 'List 列表', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'list-item', title: 'List-item 列表项', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'steps', title: 'Steps 步骤条', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'steps-item', title: 'Steps-item 步骤条项', category: '数据展示', hasUniapp: true, hasUniappX: false },
  { name: 'tag', title: 'Tag 标签', category: '数据展示', hasUniapp: true, hasUniappX: true },
  { name: 'action-sheet', title: 'Action-sheet 动作面板', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'dialog', title: 'Dialog 弹窗', category: '反馈组件', hasUniapp: true, hasUniappX: false },
  { name: 'loading-icon', title: 'Loading-icon 加载图标', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'loading-page', title: 'Loading-page 加载页', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'message', title: 'Message 消息提示', category: '反馈组件', hasUniapp: true, hasUniappX: false },
  { name: 'modal', title: 'Modal 模态框', category: '反馈组件', hasUniapp: false, hasUniappX: true },
  { name: 'notify', title: 'Notify 通知', category: '反馈组件', hasUniapp: false, hasUniappX: true },
  { name: 'overlay', title: 'Overlay 遮罩层', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'popover', title: 'Popover 气泡弹出框', category: '反馈组件', hasUniapp: true, hasUniappX: false },
  { name: 'popup', title: 'Popup 弹出层', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'toast', title: 'Toast 轻提示', category: '反馈组件', hasUniapp: true, hasUniappX: true },
  { name: 'navbar', title: 'Navbar 导航栏', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'navbar-mini', title: 'Navbar-mini 小程序导航栏', category: '导航组件', hasUniapp: false, hasUniappX: true },
  { name: 'tabbar', title: 'Tabbar 底部导航栏', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabbar-item', title: 'Tabbar-item 底部导航栏项', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabs', title: 'Tabs 标签页', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'tabs-item', title: 'Tabs-item 标签页项', category: '导航组件', hasUniapp: true, hasUniappX: true },
  { name: 'gap', title: 'Gap 间隔槽', category: '布局组件', hasUniapp: true, hasUniappX: true },
  { name: 'safe-bottom', title: 'Safe-bottom 底部安全区', category: '布局组件', hasUniapp: true, hasUniappX: true },
  { name: 'status-bar', title: 'Status-bar 状态栏', category: '布局组件', hasUniapp: true, hasUniappX: true },
  { name: 'sticky', title: 'Sticky 吸顶容器', category: '布局组件', hasUniapp: true, hasUniappX: false },
  { name: 'back-top', title: 'Back-top 返回顶部', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'circle-progress', title: 'Circle-progress 圆形进度条', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'column-notice', title: 'Column-notice 垂直通知', category: '其他组件', hasUniapp: true, hasUniappX: true },
  { name: 'line-progress', title: 'Line-progress 线形进度条', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'loadmore', title: 'Loadmore 加载更多', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'notice-bar', title: 'Notice-bar 通知栏', category: '其他组件', hasUniapp: true, hasUniappX: true },
  { name: 'row-notice', title: 'Row-notice 水平通知', category: '其他组件', hasUniapp: true, hasUniappX: true },
  { name: 'segmented', title: 'Segmented 分段器', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'imageviewer', title: 'Imageviewer 图片预览', category: '其他组件', hasUniapp: true, hasUniappX: false },
  { name: 'stepper', title: 'Stepper 步进器', category: '其他组件', hasUniapp: true, hasUniappX: false },

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
