<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">bread-crumb 面包屑导航</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="demo-block">
          <text class="demo-label">默认用法</text>
          <tsm-breadcrumb>
            <tsm-breadcrumb-item v-for="(item, index) in basicItems" :key="index" :label="item.name" />
          </tsm-breadcrumb>
        </view>
        <view class="demo-block">
          <text class="demo-label">隐藏单项图标</text>
          <tsm-breadcrumb>
            <tsm-breadcrumb-item
              v-for="(item, index) in basicItems"
              :key="index"
              :label="item.name"
              :show-item-icon="false"
            />
          </tsm-breadcrumb>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">超长文本省略</text>
        <view class="demo-block">
          <text class="demo-label">末尾省略（默认）</text>
          <tsm-breadcrumb>
            <tsm-breadcrumb-item
              v-for="(item, index) in longTextItems"
              :key="index"
              :label="item.name"
              ellipsis-mode="end"
            />
          </tsm-breadcrumb>
        </view>
        <view class="demo-block">
          <text class="demo-label">中间省略</text>
          <tsm-breadcrumb>
            <tsm-breadcrumb-item
              v-for="(item, index) in longTextItems"
              :key="index"
              :label="item.name"
              ellipsis-mode="middle"
            />
          </tsm-breadcrumb>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">换行展示</text>
        <view class="demo-block">
          <text class="demo-label">多项自动换行</text>
          <tsm-breadcrumb>
            <tsm-breadcrumb-item v-for="(item, index) in manyItems" :key="index" :label="item.name" />
          </tsm-breadcrumb>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">点击事件</text>
        <tsm-breadcrumb>
          <tsm-breadcrumb-item
            v-for="(item, index) in customFieldItems"
            :key="index"
            :label="item.name"
            @click="handleClick(item, index)"
          />
        </tsm-breadcrumb>
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
  padding: 12px;
  background: #f7f8fa;
  height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.demo-block {
  margin-bottom: 10px;
}

.demo-block:last-child {
  margin-bottom: 0;
}

.demo-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.event-log {
  margin-top: 10px;
  font-size: 14px;
  color: #4b5563;
}
</style>
