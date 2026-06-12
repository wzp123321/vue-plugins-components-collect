<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">进度条组件</text>

        <view class="progress-item">
          <text class="progress-label">信息状态-动态变化</text>
          <tsm-progress :percentage="percentage" status="info" />
        </view>

        <view class="progress-item">
          <text class="progress-label">成功状态（100%）-无文字</text>
          <tsm-progress :percentage="100" status="success" :show-text="false" />
        </view>
        <view class="progress-item">
          <text class="progress-label">成功状态（100%）</text>
          <tsm-progress :percentage="100" status="success" />
        </view>

        <view class="progress-item">
          <text class="progress-label">警告状态（80%）</text>
          <tsm-progress :percentage="80" status="warning" />
        </view>

        <view class="progress-item">
          <text class="progress-label">错误状态（80%）</text>
          <tsm-progress :percentage="80" status="error" />
        </view>

        <view class="progress-item">
          <text class="progress-label">文字内置（80%）</text>
          <tsm-progress :percentage="80" :text-inside="true" status="info" />
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const percentage = ref(0);
let si = setInterval(() => {
  if (percentage.value >= 100) {
    clearInterval(si);
    return;
  }
  percentage.value += 20;
}, 1000);
</script>

<style scoped lang="scss">
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.progress-item {
  margin-bottom: 20px;

  .progress-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
}
</style>
