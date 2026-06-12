<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="header__title">TS Mobile UI</text>
        <text class="header__subtitle">UniApp 组件库</text>
      </view>

      <view v-for="category in categories" :key="category.name" class="category">
        <view class="category__title">{{ category.name }}</view>
        <view class="category__grid">
          <view v-for="item in category.items" :key="item.path" class="card" @click="navToDemo(item.path)">
            <text class="card__name">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
interface PageItem {
  path: string;
  title: string;
}

interface Category {
  name: string;
  items: PageItem[];
}

const categories: Category[] = [
  {
    name: '基础组件',
    items: [
      { path: 'pages/tsm-button/index', title: 'Button 按钮' },
      { path: 'pages/tsm-avatar/index', title: 'Avatar 头像' },
      { path: 'pages/tsm-tag/index', title: 'Tag 标签' },
      { path: 'pages/tsm-badge/index', title: 'Badge 徽标' },
    ],
  },
  {
    name: '表单组件',
    items: [
      { path: 'pages/tsm-form/index', title: 'Form 表单' },
      { path: 'pages/tsm-input/index', title: 'Input 输入框' },
      { path: 'pages/tsm-textarea/index', title: 'Textarea 文本域' },
      { path: 'pages/tsm-checkbox/index', title: 'Checkbox 多选' },
      { path: 'pages/tsm-radio/index', title: 'Radio 单选' },
      { path: 'pages/tsm-switch/index', title: 'Switch 开关' },
      { path: 'pages/tsm-rate/index', title: 'Rate 评分' },
      { path: 'pages/tsm-stepper/index', title: 'Stepper 步进器' },
      { path: 'pages/tsm-picker/index', title: 'Picker 选择器' },
      { path: 'pages/tsm-datetime-picker/index', title: 'DateTimePicker 日期时间选择器' },
      { path: 'pages/tsm-cascader/index', title: 'Cascader 级联选择' },
      { path: 'pages/tsm-search/index', title: 'Search 搜索' },
      { path: 'pages/tsm-upload/index', title: 'Upload 上传' },
    ],
  },
  {
    name: '反馈组件',
    items: [
      { path: 'pages/tsm-dialog/index', title: 'Dialog 对话框' },
      { path: 'pages/tsm-toast/index', title: 'Toast 轻提示' },
      { path: 'pages/tsm-message/index', title: 'Message 消息' },
      { path: 'pages/tsm-loading/index', title: 'Loading 加载' },
      { path: 'pages/tsm-popup/index', title: 'Popup 弹窗' },
      { path: 'pages/tsm-action-sheet/index', title: 'ActionSheet 动作面板' },
    ],
  },
  {
    name: '导航组件',
    items: [
      { path: 'pages/tsm-tabs/index', title: 'Tabs 标签页' },
      { path: 'pages/tsm-tabbar/index', title: 'Tabbar 标签栏' },
      { path: 'pages/tsm-breadcrumb/index', title: 'Breadcrumb 面包屑' },
      { path: 'pages/tsm-steps/index', title: 'Steps 步骤条' },
      { path: 'pages/tsm-fab-button/index', title: 'FabButton 浮动按钮' },
    ],
  },
  {
    name: '布局组件',
    items: [
      { path: 'pages/tsm-card/index', title: 'Card 卡片' },
      { path: 'pages/tsm-empty/index', title: 'Empty 空状态' },
      { path: 'pages/tsm-progress/index', title: 'Progress 进度条' },
      { path: 'pages/tsm-list/index', title: 'List 列表' },
    ],
  },
  {
    name: '业务组件',
    items: [
      { path: 'pages/tsmbiz-select-department-employee/index', title: 'SelectEmployee 部门员工选择' },
      { path: 'pages/tsmbiz-tdf-render/index', title: '动态表单渲染器' },
    ],
  },
];

function navToDemo(path: string) {
  uni.navigateTo({
    url: `/${path}`,
  });
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 16px 12px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.header__title {
  font-size: 24px;
  font-weight: 600;
  color: #182431;
  line-height: 1.4;
}

.header__subtitle {
  font-size: 14px;
  color: #79879a;
  margin-top: 4px;
}

.category {
  margin-bottom: 20px;
}

.category__title {
  font-size: 16px;
  font-weight: 600;
  color: #182431;
  margin-bottom: 12px;
  padding-left: 4px;
}

.category__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  width: calc(50% - 5px);
  background-color: #ffffff;
  border-radius: 8px;
  padding: 14px 12px;
  box-sizing: border-box;
}

.card:active {
  background-color: #e8eaed;
}

.card__name {
  font-size: 14px;
  color: #475059;
  line-height: 1.4;
}
</style>
