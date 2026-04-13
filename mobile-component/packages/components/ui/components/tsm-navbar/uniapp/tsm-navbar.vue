/** * Navbar 自定义导航栏 * @description
此组件一般用于在特殊情况下，需要自定义导航栏的时候用到，一般建议使用uni-app带的导航栏。 */
<template>
  <view class="tsm-navbar" :class="[customClass]">
    <view
      class="tsm-navbar__placeholder"
      v-if="fixed && placeholder"
      :style="{
        height: navbarHeight + 'px',
      }"
    ></view>
    <view :class="{ 'tsm-navbar--fixed': fixed }">
      <tsm-status-bar v-if="safeAreaInsetTop" :bgColor="bgColor"></tsm-status-bar>
      <view
        class="tsm-navbar__content"
        :class="{ 'tsm-border-bottom': border }"
        :style="{
          height: addUnit(height),
          backgroundColor: bgColor,
        }"
      >
        <view
          class="tsm-navbar__content__left"
          hover-class="tsm-navbar__content__left--hover"
          hover-start-time="150"
          @tap="leftClick"
        >
          <slot name="left">
            <icon-setting />
            <text
              v-if="leftText"
              :style="{
                color: leftIconColor,
              }"
              class="tsm-navbar__content__left__text"
              >{{ leftText }}</text
            >
          </slot>
        </view>
        <slot name="center">
          <text
            class="tsm-line-1 tsm-navbar__content__title"
            :style="[
              {
                width: addUnit(titleWidth),
              },
              titleStyleObj,
            ]"
            >{{ title }}</text
          >
        </slot>
        <view class="tsm-navbar__content__right" v-if="rightIcon || rightText" @tap="rightClick">
          <slot name="right">
            <icon-setting />
            <text v-if="rightText" class="tsm-navbar__content__right__text">{{ rightText }}</text>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NavbarProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle, getPx, sys } from '../../../libs/uniapp/function/index';

/**
 * Navbar 组件 Props
 * @property {boolean} safeAreaInsetTop - 是否开启顶部安全区适配
 * @property {boolean} placeholder - 固定在顶部时，是否生成一个等高元素，以防止塌陷
 * @property {boolean} fixed - 导航栏是否固定在顶部
 * @property {boolean} border - 导航栏底部是否显示下边框
 * @property {string} leftIcon - 左边返回图标的名称
 * @property {string} leftText - 左边的提示文字
 * @property {string} rightText - 右边的提示文字
 * @property {string} rightIcon - 右边返回图标的名称
 * @property {string} title - 导航栏标题
 * @property {string} bgColor - 导航栏背景设置
 * @property {string|number} titleWidth - 导航栏标题的最大宽度
 * @property {string|number} height - 导航栏高度
 * @property {string|number} leftIconSize - 左侧返回图标的大小
 * @property {string|number} leftIconColor - 左侧返回图标的颜色
 * @property {boolean} autoBack - 点击左侧区域，是否自动返回上一页
 * @property {object|string} titleStyle - 标题的样式
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<NavbarProps>(), defaultProps);

const emit = defineEmits<{
  leftClick: [];
  rightClick: [];
}>();

// 计算导航栏占位高度
const navbarHeight = computed(() => {
  return getPx(props.height) + sys().statusBarHeight;
});

// 解析标题样式
const titleStyleObj = computed(() => {
  return addStyle(props.titleStyle || {});
});

// 点击左侧区域
const leftClick = () => {
  emit('leftClick');
  if (props.autoBack) {
    uni.navigateBack();
  }
};

// 点击右侧区域
const rightClick = () => {
  emit('rightClick');
};
</script>

<style scoped lang="scss">
.tsm-navbar {
  /* 占位元素 */
}

.tsm-navbar__placeholder {
  width: 100%;
}

.tsm-navbar--fixed {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 11;
}

.tsm-navbar__content {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 44px;
  background-color: #9acafc;
  position: relative;
  justify-content: center;
}

.tsm-navbar__content__left,
.tsm-navbar__content__right {
  padding: 0 13px;
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tsm-navbar__content__left {
  left: 0;
}

.tsm-navbar__content__left--hover {
  opacity: 0.7;
}

.tsm-navbar__content__left__text {
  font-size: 15px;
  margin-left: 3px;
}

.tsm-navbar__content__title {
  text-align: center;
  font-size: 16px;
  color: #303133;
}

.tsm-navbar__content__right {
  right: 0;
}

.tsm-navbar__content__right__text {
  font-size: 15px;
  margin-left: 3px;
}
</style>
