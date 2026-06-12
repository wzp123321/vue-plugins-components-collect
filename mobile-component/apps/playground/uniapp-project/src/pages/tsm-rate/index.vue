<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Rate 评分</text>
        <text class="subtitle">用于评分选择，支持点击选择</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="demo-row">
          <text class="demo-label">默认评分</text>
          <tsm-rate v-model:value="value1" />
        </view>
        <view class="demo-row">
          <text class="demo-label">只读展示</text>
          <tsm-rate :value="3.3" disabled />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">事件监听</text>
        <view class="demo-row">
          <text class="demo-label">选择评分</text>
          <tsm-rate v-model:value="value2" @change="onChange" />
        </view>
        <text class="demo-tip">当前评分：{{ value2 }}</text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value1 = ref(3);
const value2 = ref(0);

const onChange = (value: number) => {
  console.log('rate change:', value);
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  margin-bottom: 8px;
  display: block;
}

.subtitle {
  font-size: 14px;
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
  display: block;
}

.demo-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  margin-bottom: 16px;
  display: block;
}

.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.demo-row + .demo-row {
  border-top: 1px solid var(--var-tsm-color-bg-tertiary, rgba(237, 239, 242, 1));
}

.demo-label {
  font-size: 14px;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
}

.demo-tip {
  font-size: 13px;
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
  margin-top: 8px;
  display: block;
}
</style>
