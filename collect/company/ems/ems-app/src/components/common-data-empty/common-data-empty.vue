<template>
  <view class="common-data-empty">
    <img src="../../assets/images/common/common-data-empty.svg" />
    <text class="cde-message">{{ props.title }}</text>
    <text class="cde-description" v-if="!!props.subTitle">{{ props.subTitle }}</text>
  </view>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '暂无内容',
  },
  subTitle: {
    type: String,
    default: '',
  },
});
</script>
<style lang="scss" scoped>
.common-data-empty {
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

  .cde-message {
    display: block;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b16);
  }

  .cde-description {
    margin-top: 8rpx;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-b14);
  }
}
</style>
