<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Breadcrumb 面包屑导航</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="demo-block">
          <text class="demo-label">默认 icon（icon-home）</text>
          <tsm-bread-crumb :items="basicItems" />
        </view>
        <view class="demo-block">
          <text class="demo-label">隐藏 icon</text>
          <tsm-bread-crumb :items="basicItems" :show-item-icon="false" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">超长文本省略</text>
        <view class="demo-block">
          <text class="demo-label">末尾省略</text>
          <tsm-bread-crumb :items="longTextItems" ellipsis-mode="end" />
        </view>
        <view class="demo-block">
          <text class="demo-label">中间省略</text>
          <tsm-bread-crumb :items="longTextItems" ellipsis-mode="middle" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">内容溢出处理</text>
        <view class="demo-block">
          <text class="demo-label">横向滚动（scroll）</text>
          <tsm-bread-crumb :items="manyItems" overflow-mode="scroll" />
        </view>
        <view class="demo-block">
          <text class="demo-label">折叠换行（wrap）</text>
          <tsm-bread-crumb :items="manyItems" overflow-mode="wrap" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">自定义字段映射 + 点击事件</text>
        <tsm-bread-crumb :items="customFieldItems" item-text-key="name" separator-icon=">" @click="handleClick" />
        <text class="event-log" v-if="lastClickText"> 最近点击：{{ lastClickText }} </text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const basicItems = [
  { name: '一级页面' },
  { name: '二级页面二级页面二级页面二级页面二级页面二级页面二级页面二级页面' },
  { name: '当前页面' },
];

const longTextItems = [
  { name: '一级页面' },
  { name: '这是一个很长很长很长的二级页面名称用于测试省略效果' },
  { name: '这是一个很长很长很长的当前页面名称用于测试省略效果' },
];

const manyItems = [
  { name: '一级页面' },
  { name: '二级页面' },
  { name: '三级页面' },
  { name: '四级页面' },
  { name: '五级页面' },
  { name: '六级页面' },
];

const customFieldItems = [
  { id: 'a1', name: '首页' },
  { id: 'a2', name: '商品列表页' },
  { id: 'a3', name: '商品详情页' },
];

const lastClickText = ref('');

const handleClick = (item: Record<string, unknown>, index: number) => {
  const displayText = String(item.name ?? '');
  lastClickText.value = `${index + 1} - ${displayText}`;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 12px 12px 6px;
  margin-bottom: 12px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 16px 14px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #111827;
}

.demo-block {
  margin-bottom: 14px;
}

.demo-block:last-child {
  margin-bottom: 0;
}

.demo-label {
  display: block;
  font-size: 20px;
  color: #6b7280;
  margin-bottom: 10px;
}

.event-log {
  margin-top: 12px;
  font-size: 20px;
  color: #4b5563;
}
</style>
