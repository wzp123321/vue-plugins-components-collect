<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Button 按钮</text>

      <view class="section">
        <text class="section-title">基础用法</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary">主要按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="info">默认按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="info">信息按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="success">成功按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="warning">警告按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="error">危险按钮</tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同尺寸</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" size="large">大号按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="primary">默认按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="primary" size="small">小号按钮</tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">禁用状态</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" disabled>禁用的主要按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="info" disabled>禁用的默认按钮</tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">加载状态</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" loading>加载中的按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="info" loading>加载中的按钮</tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">图标按钮</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" icon="search">搜索</tsm-button></view>
          <view class="button-group__item"><tsm-button type="info" icon="close">关闭</tsm-button></view>
          <view class="button-group__item"><tsm-button type="primary" icon="search"></tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">按钮形状</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" shape="square">方形按钮</tsm-button></view>
          <view class="button-group__item"><tsm-button type="primary" shape="circle">圆形按钮</tsm-button></view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">事件处理</text>
        <view class="button-group">
          <view class="button-group__item"><tsm-button type="primary" @click="handleClick">点击我</tsm-button></view>
        </view>
        <text class="event-log" v-if="clickCount > 0">点击次数：{{ clickCount }}</text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const clickCount = ref(0);

function handleClick() {
  clickCount.value++;
  uni.showToast({
    title: '按钮被点击了！',
    duration: 1500,
  });
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #666;
}

.button-group {
  @include tsm-flex-wrap-gap-container(15px);
}

.button-group__item {
  @include tsm-flex-wrap-gap-item(15px);
}

.event-log {
  margin-top: 20px;
  font-size: 20px;
  color: #999;
}
</style>
