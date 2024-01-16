<template>
  <view class="common-tree-empty">
    <img src="../../assets/images/common/common-tree-empty-bg.svg" />
    <view class="cte-message">{{ props.title }}</view>
    <view class="cte-description">{{ props.subTitle }}</view>
  </view>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '未配置区域树模型',
  },
  subTitle: {
    type: String,
    default: '请先到树模型管理界面配置区域树模型',
  },
});
</script>
<style lang="scss" scoped>
.common-tree-empty {
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

  .cte-message {
    display: block;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b16);
  }

  .cte-description {
    margin-top: 8rpx;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-b14);
  }
}
</style>
