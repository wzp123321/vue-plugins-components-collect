<template>
  <!-- https://uniapp.dcloud.net.cn/tutorial/syntax-css.html#css-%E5%8F%98%E9%87%8F -->
  <uni-nav-bar
    class="common-navigation-bar"
    title="props.title"
    :border="props.border"
    :statusBar="props.statusBar"
    :backgroundColor="backgroundColor"
    :color="props.color"
    :fixed="props.fixed"
    :height="'44px'"
  >
    <template v-slot:left>
      <icon-left class="cnb-back" @click="goBack" />
    </template>
    <!-- 导航栏标题 -->
    <view class="cnb-title" slot="default">
      <view v-if="!$slots.middle" :style="{ color: props.color }">
        {{ props.title }}
      </view>
      <!-- 插槽 -->
      <slot name="middle" v-else></slot>
    </view>
    <template v-slot:right>
      <slot name="right"></slot>
    </template>
  </uni-nav-bar>
</template>

<script lang="ts" setup>
// 组件
import { IconLeft } from '@arco-iconbox/vue-tem';
// 枚举
import { Common_EBridgeType } from '@/config/enum';
// 桥服务
import nativeBridge from '../../core/nativeBridge';
import { mapIsAppPlat, mapIsWxWorkH5Plat } from '@/utils';

const props = defineProps({
  // 是否调用原生方法
  nativeFlag: {
    type: Boolean,
    default: true,
  },
  // 标题
  title: {
    type: String,
    default: '',
  },
  // 是否有边框
  border: {
    type: Boolean,
    default: false,
  },
  // 是否包含状态栏
  statusBar: {
    type: Boolean,
    default: true,
  },
  // 自定义背景样式
  backgroundColor: {
    type: String,
    default: '',
  },
  // 字体颜色
  color: {
    type: String,
    default: 'var(--tem-text-color-primary)',
  },
  // 是否固定顶部
  fixed: {
    type: Boolean,
    default: true,
  },
});
/**
 * 返回
 */
const goBack = (): void => {
  if (props.nativeFlag) {
    console.log('%c✨✨调用原生返回方法✨✨', 'font-size: 24px', mapIsAppPlat(), mapIsWxWorkH5Plat());
    // 如果是APP
    if (mapIsAppPlat()) {
      nativeBridge.nativeCall(Common_EBridgeType.返回上一层, { pageHome: 1 }, () => {});
    } else if (mapIsWxWorkH5Plat()) {
      window.history.go(-window.history.length + 2);
    }
  } else {
    uni.navigateBack();
    console.log('%c✨✨调用UNI返回方法✨✨', 'font-size: 24px');
  }
};
</script>

<style lang="scss" scoped>
.common-navigation-bar {
  position: relative;
  width: 100%;
  transition: all 233ms;

  .cnb-back {
    width: 48rpx;
    height: 48rpx;
  }

  .cnb-title {
    width: 100%;
    text-align: center;
    font-size: var(--tem-font-size-h18);
    color: var(--tem-text-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
