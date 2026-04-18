import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../../..')

export default defineConfig({
  vite: {
    server: {
      port: 5176,
      fs: {
        allow: [workspaceRoot]
      }
    },
    define: {
      __UNIAPP_DEMO_URL__: JSON.stringify(process.env.UNIAPP_DEMO_URL || 'http://localhost:10013'),
      __UNIAPP_X_DEMO_URL__: JSON.stringify(process.env.UNIAPP_X_DEMO_URL || 'http://localhost:10014')
    }
  },
  title: "phillUI",
  description: "A uView-like component library for UniApp & UniApp X",
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/install' },      { 
        text: '组件', 
        items: [
          { text: 'UniApp', link: '/components/uniapp/tsm-button' },
          { text: 'UniApp-X', link: '/components/uniapp-x/tsm-button' }
        ]
      },
      { text: 'GitHub', link: 'https://github.com/lvli0401/phillUI' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '基础指南',
          items: [
            { text: '安装', link: '/guide/install' },
            { text: '快速上手', link: '/guide/quickstart' }
          ]
        }
      ],
      '/components/uniapp/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/uniapp/tsm-button' },
            { text: 'Image 图片', link: '/components/uniapp/tsm-image' },
            { text: 'Text 文本', link: '/components/uniapp/tsm-text' },
            { text: 'Transition 动画', link: '/components/uniapp/tsm-transition' },
          ]
        },
        {
          text: '表单组件',
          items: [
            { text: 'Calendar 日历', link: '/components/uniapp/tsm-calendar' },
            { text: 'Checkbox 复选框', link: '/components/uniapp/tsm-checkbox' },
            { text: 'Checkbox-group 复选框组', link: '/components/uniapp/tsm-checkbox-group' },
            { text: 'Datetime-picker 日期选择器', link: '/components/uniapp/tsm-datetime-picker' },
            { text: 'Form 表单', link: '/components/uniapp/tsm-form' },
            { text: 'Form-item 表单项', link: '/components/uniapp/tsm-form-item' },
            { text: 'Input 输入框', link: '/components/uniapp/tsm-input' },
            { text: 'Number-box 数字输入框', link: '/components/uniapp/tsm-number-box' },
            { text: 'Picker 选择器', link: '/components/uniapp/tsm-picker' },
            { text: 'Picker-column 选择器列', link: '/components/uniapp/tsm-picker-column' },
            { text: 'Radio 单选框', link: '/components/uniapp/tsm-radio' },
            { text: 'Radio-group 单选框组', link: '/components/uniapp/tsm-radio-group' },
            { text: 'Rate 评分', link: '/components/uniapp/tsm-rate' },
            { text: 'Search 搜索', link: '/components/uniapp/tsm-search' },
            { text: 'Slider 滑块', link: '/components/uniapp/tsm-slider' },
            { text: 'Switch 开关', link: '/components/uniapp/tsm-switch' },
            { text: 'Textarea 文本域', link: '/components/uniapp/tsm-textarea' },
            { text: 'Upload 上传', link: '/components/uniapp/tsm-upload' },
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Avatar 头像', link: '/components/uniapp/tsm-avatar' },
            { text: 'Badge 徽标', link: '/components/uniapp/tsm-badge' },
            { text: 'Card 卡片', link: '/components/uniapp/tsm-card' },
            { text: 'Collapse 折叠面板', link: '/components/uniapp/tsm-collapse' },
            { text: 'Collapse-item 折叠面板项', link: '/components/uniapp/tsm-collapse-item' },
            { text: 'Empty 空状态', link: '/components/uniapp/tsm-empty' },
            { text: 'Index-anchor 索引锚点', link: '/components/uniapp/tsm-index-anchor' },
            { text: 'Index-item 索引项', link: '/components/uniapp/tsm-index-item' },
            { text: 'Index-list 索引列表', link: '/components/uniapp/tsm-index-list' },
            { text: 'List 列表', link: '/components/uniapp/tsm-list' },
            { text: 'List-item 列表项', link: '/components/uniapp/tsm-list-item' },
            { text: 'Steps 步骤条', link: '/components/uniapp/tsm-steps' },
            { text: 'Steps-item 步骤条项', link: '/components/uniapp/tsm-steps-item' },
            { text: 'Tag 标签', link: '/components/uniapp/tsm-tag' },
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Action-sheet 动作面板', link: '/components/uniapp/tsm-action-sheet' },
            { text: 'Dialog 弹窗', link: '/components/uniapp/tsm-dialog' },
            { text: 'Loading-icon 加载图标', link: '/components/uniapp/tsm-loading-icon' },
            { text: 'Message 消息提示', link: '/components/uniapp/tsm-message' },
            { text: 'Overlay 遮罩层', link: '/components/uniapp/tsm-overlay' },
            { text: 'Popover 气泡弹出框', link: '/components/uniapp/tsm-popover' },
            { text: 'Popup 弹出层', link: '/components/uniapp/tsm-popup' },
            { text: 'Toast 轻提示', link: '/components/uniapp/tsm-toast' },
          ]
        },
        {
          text: '导航组件',
          items: [
            { text: 'Tabbar 底部导航栏', link: '/components/uniapp/tsm-tabbar' },
            { text: 'Tabbar-item 底部导航栏项', link: '/components/uniapp/tsm-tabbar-item' },
            { text: 'Tabs 标签页', link: '/components/uniapp/tsm-tabs' },
            { text: 'Tabs-item 标签页项', link: '/components/uniapp/tsm-tabs-item' },
          ]
        },
        {
          text: '布局组件',
          items: [
            { text: 'Safe-bottom 底部安全区', link: '/components/uniapp/tsm-safe-bottom' },
            { text: 'Sticky 吸顶容器', link: '/components/uniapp/tsm-sticky' },
          ]
        },
        {
          text: '其他组件',
          items: [
            { text: 'Back-top 返回顶部', link: '/components/uniapp/tsm-back-top' },
            { text: 'Circle-progress 圆形进度条', link: '/components/uniapp/tsm-circle-progress' },
            { text: 'Column-notice 垂直通知', link: '/components/uniapp/tsm-column-notice' },
            { text: 'Line-progress 线形进度条', link: '/components/uniapp/tsm-line-progress' },
            { text: 'Loadmore 加载更多', link: '/components/uniapp/tsm-loadmore' },
            { text: 'Segmented 分段器', link: '/components/uniapp/tsm-segmented' },
            { text: 'Imageviewer 图片预览', link: '/components/uniapp/tsm-imageviewer' },
            { text: 'Stepper 步进器', link: '/components/uniapp/tsm-stepper' },
          ]
        },

      ],
      '/components/uniapp-x/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/uniapp-x/tsm-button' },
            { text: 'Image 图片', link: '/components/uniapp-x/tsm-image' },
            { text: 'Text 文本', link: '/components/uniapp-x/tsm-text' },
            { text: 'Transition 动画', link: '/components/uniapp-x/tsm-transition' },
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Avatar 头像', link: '/components/uniapp-x/tsm-avatar' },
            { text: 'Badge 徽标', link: '/components/uniapp-x/tsm-badge' },
            { text: 'Card 卡片', link: '/components/uniapp-x/tsm-card' },
            { text: 'Empty 空状态', link: '/components/uniapp-x/tsm-empty' },
            { text: 'List 列表', link: '/components/uniapp-x/tsm-list' },
            { text: 'List-item 列表项', link: '/components/uniapp-x/tsm-list-item' },
            { text: 'Tag 标签', link: '/components/uniapp-x/tsm-tag' },
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Action-sheet 动作面板', link: '/components/uniapp-x/tsm-action-sheet' },
            { text: 'Loading-icon 加载图标', link: '/components/uniapp-x/tsm-loading-icon' },
            { text: 'Overlay 遮罩层', link: '/components/uniapp-x/tsm-overlay' },
            { text: 'Popup 弹出层', link: '/components/uniapp-x/tsm-popup' },
            { text: 'Toast 轻提示', link: '/components/uniapp-x/tsm-toast' },
          ]
        },
        {
          text: '导航组件',
          items: [
            { text: 'Tabbar 底部导航栏', link: '/components/uniapp-x/tsm-tabbar' },
            { text: 'Tabbar-item 底部导航栏项', link: '/components/uniapp-x/tsm-tabbar-item' },
            { text: 'Tabs 标签页', link: '/components/uniapp-x/tsm-tabs' },
            { text: 'Tabs-item 标签页项', link: '/components/uniapp-x/tsm-tabs-item' },
          ]
        },
        {
          text: '布局组件',
          items: [
            { text: 'Safe-bottom 底部安全区', link: '/components/uniapp-x/tsm-safe-bottom' },
          ]
        },
        {
          text: '其他组件',
          items: [
            { text: 'Column-notice 垂直通知', link: '/components/uniapp-x/tsm-column-notice' },
          ]
        },

      ],
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present lvli0401'
    }
  }
})
