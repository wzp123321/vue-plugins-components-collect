/** * Tabs 标签页组件 * @description 标签页组件，支持滚动和滑块动画 */
<template>
  <view class="tsm-tabs" :class="bemClass" :style="customStyle">
    <view class="tsm-tabs__header">
      <scroll-view :scroll-x="scrollable" :scroll-left="scrollLeft" scroll-with-animation class="tsm-tabs__scroll">
        <view class="tsm-tabs__nav">
          <view
            v-for="(item, index) in list"
            :key="index"
            class="tsm-tabs__nav__item"
            :class="{
              'tsm-tabs__nav__item--active': innerCurrent === index,
              'tsm-tabs__nav__item--disabled': item.disabled,
            }"
            @tap="onClick(item, index)"
          >
            <text class="tsm-tabs__nav__text">{{ item[keyName] }}</text>
          </view>
          <view class="tsm-tabs__nav__line" :style="lineStyle"></view>
        </view>
      </scroll-view>
      <view v-if="showListIcon" class="tsm-tabs__list-icon" @tap="onListIconClick">
        <icon-list />
      </view>
    </view>
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
  'list-click': [];
}>();

const innerCurrent = ref(props.current);
const scrollLeft = ref(0);
const lineOffsetLeft = ref(0);

const bemClass = computed(() => {
  return bem(
    'tabs',
    [props.size],
    [
      ['scrollable', props.scrollable],
      ['has-list-icon', props.showListIcon],
    ],
    props.customClass
  );
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

const onListIconClick = () => {
  emit('list-click');
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-tabs {
  width: 100%;
}

.tsm-tabs__header {
  display: flex;
  align-items: center;
}

.tsm-tabs__scroll {
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
}

.tsm-tabs__nav {
  @include tsm-display-inline-flex();
  position: relative;
  align-items: center;
}

.tsm-tabs__nav__item {
  @include tsm-display-inline-flex();
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tsm-tabs--large .tsm-tabs__nav__item {
  flex: 1;
  min-width: 0;
  padding: 24px 0 16px;
}

.tsm-tabs--small .tsm-tabs__nav__item {
  padding: 16px 24px;
}

.tsm-tabs--scrollable .tsm-tabs__nav__item {
  flex: none;
  padding: 16px 24px;
}

.tsm-tabs__nav__item--active {
  font-weight: bold;
}

.tsm-tabs__nav__item--disabled {
  color: #c8c9cc;
  cursor: not-allowed;
}

.tsm-tabs__nav__text {
  white-space: nowrap;
}

.tsm-tabs--large .tsm-tabs__nav__text {
  font-size: 28px;
  color: #969799;
}

.tsm-tabs--large .tsm-tabs__nav__item--active .tsm-tabs__nav__text {
  color: #323233;
}

.tsm-tabs--small .tsm-tabs__nav__text {
  font-size: 24px;
  color: #969799;
}

.tsm-tabs--small .tsm-tabs__nav__item--active .tsm-tabs__nav__text {
  color: #323233;
}

.tsm-tabs--scrollable .tsm-tabs__nav__text {
  font-size: 28px;
  color: #969799;
}

.tsm-tabs--scrollable .tsm-tabs__nav__item--active .tsm-tabs__nav__text {
  color: #323233;
}

.tsm-tabs__nav__line {
  position: absolute;
  bottom: 0;
  border-radius: 100px;
  transition-property: transform;
}

.tsm-tabs__list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.tsm-tabs__list-icon :deep(*) {
  font-size: 40px;
  color: #969799;
}
</style>
