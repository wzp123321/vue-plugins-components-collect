<template>
  <view :class="['common-refresher', props.transparentFlag ? '' : 'is-children']">
    <img
      v-if="Common_ERefresherStatus.刷新中 === props.refresherStatus"
      class="cr-icon"
      :src="
        props.transparentFlag
          ? require('../../assets/images/common/common-loading-white.png')
          : require('../../assets/images/common/common-loading-blue.png')
      "
      alt="icon"
    />
    <text>{{ Common_ERefresherStatus.刷新中 === props.refresherStatus ? '加载中...' : '松开刷新' }} </text>
  </view>
</template>
<script lang="ts" setup>
import { Common_ERefresherStatus } from '../../config/enum';

// props
const props = defineProps({
  refresherStatus: {
    type: Number,
    default: 0,
  },
  // 是否是透明色
  transparentFlag: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss" scoped>
.common-refresher {
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  min-height: 56px;
  max-height: 56px;

  .cr-icon {
    margin-right: 12rpx;
    position: relative;
    width: 24px;
    height: 24px;
    animation-name: icon_rotate !important;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-direction: normal;
    animation-fill-mode: none;
    animation-play-state: running;
  }

  text {
    color: var(--tem-color-white);
    font-size: var(--tem-font-size-s12);
    line-height: 40rpx;
  }

  &.is-children {
    background-color: var(--tem-color-white);

    text {
      color: var(--tem-text-color-secondary);
    }
  }
}

@keyframes icon_rotate {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
