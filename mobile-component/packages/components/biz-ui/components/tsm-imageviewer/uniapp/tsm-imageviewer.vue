/** * ImageViewer 图片预览组件 * @description 图片预览组件，用于全屏预览图片 */
<template>
  <view v-if="show" class="tsm-imageviewer" :class="bemClass" :style="customStyle" @tap="onClose">
    <swiper class="tsm-imageviewer__swiper" :current="currentIndex" @change="onSwiperChange">
      <swiper-item v-for="(image, index) in images" :key="index">
        <image class="tsm-imageviewer__image" :src="image" mode="aspectFit" @tap.stop="noop" />
      </swiper-item>
    </swiper>
    <view class="tsm-imageviewer__close" @tap.stop="onClose">
      <icon-setting />
    </view>
    <view v-if="images.length > 1" class="tsm-imageviewer__indicator">
      <text>{{ currentIndex + 1 }} / {{ images.length }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ImageViewerProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * ImageViewer 组件 Props
 * @property {boolean} show - 是否显示
 * @property {array} images - 图片列表
 * @property {number} initialIndex - 当前图片索引
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<ImageViewerProps>(), defaultProps);

const emit = defineEmits<{
  close: [];
  change: [index: number];
}>();

const currentIndex = ref(props.initialIndex);

watch(
  () => props.initialIndex,
  newVal => {
    currentIndex.value = newVal;
  }
);

const bemClass = computed(() => {
  return bem('imageviewer', [], [], props.customClass);
});

const onSwiperChange = (e: any) => {
  currentIndex.value = e.detail.current;
  emit('change', currentIndex.value);
};

const onClose = () => {
  emit('close');
};

const noop = () => {};
</script>

<style scoped lang="scss">
.tsm-imageviewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tsm-imageviewer__swiper {
  width: 100%;
  height: 100%;
}

.tsm-imageviewer__image {
  width: 100%;
  height: 100%;
}

.tsm-imageviewer__close {
  position: absolute;
  top: 40px;
  right: 16px;
  z-index: 10;
}

.tsm-imageviewer__indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: 14px;
}
</style>
