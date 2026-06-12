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
      __UNIAPP_DEMO_URL__: JSON.stringify(process.env.UNIAPP_DEMO_URL || 'http://192.168.20.200:10013'),
      __UNIAPP_X_DEMO_URL__: JSON.stringify(process.env.UNIAPP_X_DEMO_URL || 'http://192.168.20.200:10013')
    }
  },
  title: "TS Mobile UI",
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
      { text: 'GitLab', link: 'http://192.168.20.76:8000/mobile/ts-mobile-ui/tree/main' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '基础指南',
          items: [
            { text: '安装', link: '/guide/install' },
            { text: '快速上手', link: '/guide/quickstart' },
            { text: 'UniApp-X 差异', link: '/guide/uniapp-x_diff' }
          ]
        }
      ],
      '/components/uniapp/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/uniapp/tsm-button' },
          ]
        },
        {
          text: '表单组件',
          items: [
            { text: 'Cascader 级联选择器', link: '/components/uniapp/tsm-cascader' },
            { text: 'Checkbox 复选框', link: '/components/uniapp/tsm-checkbox' },
            { text: 'Datetime-picker 日期选择器', link: '/components/uniapp/tsm-datetime-picker' },
            { text: 'Form 表单', link: '/components/uniapp/tsm-form' },
            { text: 'Input 输入框', link: '/components/uniapp/tsm-input' },
            { text: 'Picker 选择器', link: '/components/uniapp/tsm-picker' },
            { text: 'Radio 单选框', link: '/components/uniapp/tsm-radio' },
            { text: 'Rate 评分', link: '/components/uniapp/tsm-rate' },
            { text: 'Search 搜索', link: '/components/uniapp/tsm-search' },
            { text: 'Slider 滑块', link: '/components/uniapp/tsm-slider' },
            { text: 'Stepper 步进器', link: '/components/uniapp/tsm-stepper' },
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
            { text: 'Empty 空状态', link: '/components/uniapp/tsm-empty' },
            { text: 'List 列表', link: '/components/uniapp/tsm-list' },
            { text: 'Progress 进度条', link: '/components/uniapp/tsm-progress' },
            { text: 'Steps 步骤条', link: '/components/uniapp/tsm-steps' },
            { text: 'Tag 标签', link: '/components/uniapp/tsm-tag' },
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Action-sheet 动作面板', link: '/components/uniapp/tsm-action-sheet' },
            { text: 'Dialog 弹窗', link: '/components/uniapp/tsm-dialog' },
            { text: 'Loading 加载', link: '/components/uniapp/tsm-loading' },
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
            { text: 'Tabs 标签页', link: '/components/uniapp/tsm-tabs' },
          ]
        },
        {
          text: '其他组件',
          items: [
            { text: 'Breadcrumb 面包屑', link: '/components/uniapp/tsm-breadcrumb' },
            { text: 'Fab-button 浮动按钮', link: '/components/uniapp/tsm-fab-button' },
            { text: 'Pull-refresh 下拉刷新', link: '/components/uniapp/tsm-pull-refresh' },
            { text: 'Sidebar 侧边栏', link: '/components/uniapp/tsm-sidebar' },
]
        },

      ],
      '/components/uniapp-x/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/uniapp-x/tsm-button' },
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
]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Action-sheet 动作面板', link: '/components/uniapp-x/tsm-action-sheet' },
            { text: 'Dialog 弹窗', link: '/components/uniapp-x/tsm-dialog' },
            { text: 'Loading 加载', link: '/components/uniapp-x/tsm-loading' },
            { text: 'Message 消息提示', link: '/components/uniapp-x/tsm-message' },
            { text: 'Overlay 遮罩层', link: '/components/uniapp-x/tsm-overlay' },
            { text: 'Popup 弹出层', link: '/components/uniapp-x/tsm-popup' },
            { text: 'Toast 轻提示', link: '/components/uniapp-x/tsm-toast' },
]
        },
        {
          text: '导航组件',
          items: [
            { text: 'Tabbar 底部导航栏', link: '/components/uniapp-x/tsm-tabbar' },
            { text: 'Tabs 标签页', link: '/components/uniapp-x/tsm-tabs' },
          ]
        },
        {
          text: '其他组件',
          items: [
            { text: 'Fab-button 浮动按钮', link: '/components/uniapp-x/tsm-fab-button' },
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
