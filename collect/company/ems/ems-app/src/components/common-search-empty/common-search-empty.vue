<template>
  <view class="common-search-empty">
    <img src="../../assets/images/common/common-search-empty.svg" />
    <view class="cse-message">{{ props.title }}</view>
    <view class="cse-description">{{ props.subTitle }}</view>
  </view>
</template>
<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: '搜索结果为空',
  },
  subTitle: {
    type: String,
    default: '换个关键词试试吧',
  },
});
</script>
<style lang="scss" scoped>
.common-search-empty {
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
    width: 324rpx;
    height: 324rpx;
  }

  .cse-message {
    display: block;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b16);
  }

  .cse-description {
    margin-top: 8rpx;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-b14);
  }
}
</style>
