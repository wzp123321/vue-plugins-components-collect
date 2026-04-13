/** * Tabs 标签页组件 * @description 标签页组件，支持滚动和滑块动画 */
<template>
  <view class="tsm-tabs" :class="bemClass" :style="customStyle">
    <scroll-view :scroll-x="scrollable" :scroll-left="scrollLeft" scroll-with-animation class="tsm-tabs__scroll">
      <view class="tsm-tabs__nav">
        <view
          class="tsm-tabs__nav__item"
          :class="{
            'tsm-tabs__nav__item--active': innerCurrent === index,
            'tsm-tabs__nav__item--disabled': item.disabled,
          }"
          v-for="(item, index) in list"
          :key="index"
          @tap="onClick(item, index)"
        >
          <text class="tsm-tabs__nav__text">{{ item[keyName] }}</text>
        </view>
        <view class="tsm-tabs__nav__line" :style="lineStyle"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { TabsProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TabsProps>(), defaultProps);

const emit = defineEmits<{
  change: [index: number];
  click: [index: number];
  'update:current': [value: number];
}>();

const innerCurrent = ref(props.current);
const scrollLeft = ref(0);
const lineOffsetLeft = ref(0);

const bemClass = computed(() => {
  return bem('tabs', [props.scrollable ? 'scrollable' : ''], [], props.customClass);
});

const lineStyle = computed(() => ({
  width: props.lineWidth,
  height: props.lineHeight,
  backgroundColor: props.lineColor,
  transform: `translateX(${lineOffsetLeft.value}px)`,
  transitionDuration: `${props.duration}ms`,
}));

watch(
  () => props.current,
  newVal => {
    if (newVal !== innerCurrent.value) {
      innerCurrent.value = newVal;
      nextTick(() => updateLinePosition());
    }
  }
);

watch(
  () => props.list,
  () => {
    nextTick(() => updateLinePosition());
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => updateLinePosition());
});

const updateLinePosition = () => {
  const query = uni.createSelectorQuery();
  query
    .selectAll('.tsm-tabs__nav__item')
    .boundingClientRect((rects: any) => {
      if (rects && rects.length > 0 && innerCurrent.value < rects.length) {
        let offsetLeft = 0;
        for (let i = 0; i < innerCurrent.value; i++) {
          offsetLeft += rects[i].width;
        }
        const currentItem = rects[innerCurrent.value];
        const lw = parseInt(String(props.lineWidth)) || 40;
        lineOffsetLeft.value = offsetLeft + (currentItem.width - lw) / 2;
      }
    })
    .exec();
};

const onClick = (item: any, index: number) => {
  if (item.disabled) return;
  innerCurrent.value = index;
  emit('update:current', index);
  emit('click', index);
  emit('change', index);
  nextTick(() => updateLinePosition());
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-tabs {
  width: 100%;
}

.tsm-tabs__scroll {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

.tsm-tabs__nav {
  @include tsm-display-inline-flex();
  position: relative;
  align-items: center;
}

.tsm-tabs__nav__item {
  padding: 0 11px;
  @include tsm-display-inline-flex();
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tsm-tabs__nav__item--active {
  font-weight: bold;
}

.tsm-tabs__nav__item--disabled {
  color: #c8c9cc;
  cursor: not-allowed;
}

.tsm-tabs__nav__text {
  font-size: 15px;
  color: #606266;
  white-space: nowrap;
}

.tsm-tabs__nav__line {
  position: absolute;
  bottom: 2px;
  border-radius: 100px;
  transition-property: transform;
}
</style>
