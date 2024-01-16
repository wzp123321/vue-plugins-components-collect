<template>
  <view class="common-no-permission">
    <img src="../../assets/images/common/common-no-permission.svg" />
    <view class="cnp-message">{{ props.title }}</view>
    <view class="cnp-description">{{ props.subTitle }}</view>
  </view>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '无数据权限',
  },
  subTitle: {
    type: String,
    default: '请联系管理员给此用户配置数据权限',
  },
});
</script>
<style lang="scss" scoped>
.common-no-permission {
  width: 100%;
  height: 100%;
  flex: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--tem-color-white);
  transition: all 233ms;

  img {
    width: 320rpx;
    height: 320rpx;
  }

  .cnp-message {
    display: block;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b16);
  }

  .cnp-description {
    margin-top: 8rpx;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-b14);
  }
}
</style>
