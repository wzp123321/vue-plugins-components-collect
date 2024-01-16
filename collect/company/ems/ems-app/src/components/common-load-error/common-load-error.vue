<template>
  <view class="common-load-error">
    <img src="../../assets/images/common/common-load-error.svg" alt="bg" />
    <view class="cle-message" v-if="props.title !== ''">{{ props.title }}</view>
    <view class="cle-description" v-if="props.subTitle !== ''">{{ props.subTitle }}</view>
    <button type="button" class="cle-btn" @click="handlePageRefresh">刷新</button>
  </view>
</template>
<script lang="ts" setup>
// emits
const emits = defineEmits(['refresh']);
// props
const props = defineProps({
  // 主标题
  title: {
    type: String,
    default: '数据加载失败',
  },
  // 副标题
  subTitle: {
    type: String,
    default: '请刷新页面重试',
  },
});
/**
 * 刷新
 */
const handlePageRefresh = () => {
  emits('refresh');
};
</script>
<style lang="scss" scoped>
.common-load-error {
  flex: auto;
  width: 100%;
  height: 100%;
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

  .cle-message {
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b16);
  }

  .cle-description {
    margin-top: 8rpx;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-b14);
  }

  .cle-btn {
    background-color: var(--tem-color-primary);
    font-size: var(--tem-font-size-b16);
    color: var(--tem-color-white);
    border: none;
    width: 128rpx;
    height: 80rpx;
    margin-top: 48rpx;
  }
}
</style>
