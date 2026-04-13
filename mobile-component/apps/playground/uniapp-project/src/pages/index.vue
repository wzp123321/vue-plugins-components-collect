<template>
  <tsm-theme-provider>
    <view class="content">
      <view class="demo-entry">
        <view v-for="item in pageJson.pages" :key="item.path" class="demo-entry__item">
          <view @click="navToDemo(item.path)" class="demo-button"> {{ item.style.navigationBarTitleText }} </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import pageJson from '../pages.json';

function navToDemo(path: string) {
  uni.navigateTo({
    url: `/${path}`,
  });
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.content {
  padding: 20rpx;
}

.demo-entry {
  margin-top: 50rpx;
  display: flex;
  flex-direction: column;
  @include tsm-gap(0, 20rpx);
}

.demo-entry__item {
  @include tsm-flex-wrap-gap-item(0, 20rpx);
}

.entry-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #333;
  text-align: center;
}

.demo-button {
  width: 100%;
  box-sizing: border-box;
  background-color: #1890ff;
  color: white;
  padding: 20rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.demo-button:active {
  background-color: #40a9ff;
}
</style>
