<template>
  <view class="tsm-tabs" :class="bemClass">
    <scroll-view
      :show-scrollbar="false"
      :scroll-x="actualScrollable"
      :scroll-left="scrollLeft"
      scroll-with-animation
      class="tsm-tabs-scroll"
    >
      <view class="tsm-tabs-nav">
        <view
          v-for="(item, index) in props.list"
          :key="index"
          class="tsm-tabs-nav-item"
          :class="{
            'tsm-tabs-nav-item--active': innerCurrent === index,
            'tsm-tabs-nav-item--disabled': item.disabled,
          }"
          @tap="handleTabClick(item, index)"
        >
          <slot name="item" :item="item" :index="index">
            <text class="tsm-tabs-nav-text">{{ getItemText(item) }}</text>
          </slot>
        </view>
        <!-- #ifdef APP-NVUE -->
        <view class="tsm-tabs-nav-line" ref="tsm-tabs-nav-line"></view>
        <!-- #endif -->
        <!-- #ifndef APP-NVUE -->
        <view class="tsm-tabs-nav-line" ref="tsm-tabs-nav-line" :style="lineStyle"></view>
        <!-- #endif -->
      </view>
    </scroll-view>
    <view v-if="showListIcon" class="tsm-tabs-list-icon" @tap="handleListIconClick">
      <icon-list color="var(--tsm-color-text-primary)" :size="20" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
import type { TabsProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

// #ifdef APP-NVUE
const nvueAnimation = uni.requireNativePlugin('animation');
// #endif

const props = withDefaults(defineProps<TabsProps>(), defaultProps);

const emit = defineEmits<{
  /** 切换标签页 */
  change: [index: number];
  /** 点击标签页 */
  click: [index: number];
  /** 更新当前激活的标签页 */
  'update:current': [value: number];
  /** 点击列表图标 */
  'list-click': [];
}>();

const innerCurrent = ref(props.current);
const scrollLeft = ref(0);
const lineOffsetLeft = ref(0);
const isOverflow = ref(false);
const isFirstRender = ref(true); // 首次渲染标记，首次时滑块动画duration为0
const indicatorWidth = 16;
const internalInstance = getCurrentInstance();
const instanceProxy = internalInstance && internalInstance.proxy ? internalInstance.proxy : null;

// 仅由等距模式或实际溢出决定是否启用横向滚动，不再依赖 scrollable props。
const actualScrollable = computed(() => props.isometric || isOverflow.value);

const showListIcon = computed(() => isOverflow.value && props.isometric);

const layoutClass = computed(() => (props.isometric ? 'equidistant' : 'equal'));

const bemClass = computed(() =>
  bem(
    'tabs',
    [props.size, layoutClass.value, props.itemType],
    [
      ['scrollable', actualScrollable.value],
      ['has-list-icon', showListIcon.value],
    ]
  )
);

const lineStyle = computed(() => ({
  transform: `translateX(${lineOffsetLeft.value}px)`,
  transitionDuration: `${isFirstRender.value ? 0 : props.duration}ms`,
}));

const getRectLeft = (rect: any) => Number(rect && rect.left) || 0;
const getRectRight = (rect: any) => Number(rect && rect.right) || 0;
const getRectWidth = (rect: any) => Number(rect && rect.width) || 0;
const getRectsContentWidth = (rects: any[]) => {
  if (!rects || rects.length === 0) {
    return 0;
  }
  return Math.max(0, getRectRight(rects[rects.length - 1]) - getRectLeft(rects[0]));
};

const getItemText = (item: any) => {
  const text = String(item[props.keyName] ?? '');
  if (props.isometric && text.length > 8) {
    return text.substring(0, 8) + '...';
  }
  return text;
};

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
    nextTick(() => {
      updateLinePosition();
      checkOverflow();
    });
  },
  { deep: true }
);

watch(
  () => props.isometric,
  () => {
    nextTick(() => {
      updateLinePosition();
      checkOverflow();
    });
  }
);

onMounted(() => {
  nextTick(() => {
    updateLinePosition();
    checkOverflow();
    isFirstRender.value = false;
  });
});

/**
 * 更新激活态底部滑块位置，并在可滚动时同步调整 scroll-view 的 scrollLeft。
 *
 * 计算思路：
 * 1) 通过 selectorQuery 同时拿到：
 *    - `.tsm-tabs-scroll`：滚动容器可视宽度（用于计算最大可滚动距离）
 *    - `.tsm-tabs-nav`：导航容器左边界（用于把 item 的全局坐标转成容器内偏移）
 *    - `.tsm-tabs-nav-item`：每个标签项的位置信息（用于当前项中心点定位）
 * 2) 用当前激活项相对 nav 的 left 偏移 + 宽度，计算滑块 translateX。
 * 3) 当 `actualScrollable=true` 时，按“当前项中心点”进行居中滚动：
 *    - 先计算内容总宽与最大滚动距离
 *    - 再把目标 scrollLeft 限制在 [0, maxScrollLeft] 区间
 *
 * 兼容性与兜底：
 * - 所有 rect 数值统一经过 Number(...) || 0 处理，避免极端平台返回异常值导致 NaN。
 * - 若查询结果为空、索引越界、可视宽度无效，则直接返回，不抛异常。
 */
const updateLinePosition = () => {
  const query = uni.createSelectorQuery();
  const scopedQuery = instanceProxy ? query.in(instanceProxy as any) : query;
  scopedQuery.select('.tsm-tabs-scroll').boundingClientRect();
  scopedQuery.select('.tsm-tabs-nav').boundingClientRect();
  scopedQuery.selectAll('.tsm-tabs-nav-item').boundingClientRect();
  scopedQuery.exec((res: any) => {
    const scrollRect = res && res[0];
    const navRect = res && res[1];
    const rects = (res && res[2]) as any[];
    const safeActiveIndex = Math.max(0, Math.min(innerCurrent.value, rects.length - 1));
    if (!(rects && rects.length > 0 && safeActiveIndex < rects.length)) {
      return;
    }

    const currentItem = rects[safeActiveIndex];
    // 使用真实坐标计算滑块位置，兼容 tag 模式下 gap 引入的间距。
    const currentLeft = getRectLeft(currentItem);
    const currentWidth = getRectWidth(currentItem);
    const navLeft = getRectLeft(navRect);
    const itemOffsetLeft = currentLeft - navLeft;
    lineOffsetLeft.value = itemOffsetLeft + (currentWidth - indicatorWidth) / 2;

    // #ifdef APP-NVUE
    animation(lineOffsetLeft.value, isFirstRender.value ? 0 : props.duration);
    // #endif

    if (!actualScrollable.value) {
      return;
    }
    const viewportWidth = Number(scrollRect && scrollRect.width) || 0;
    if (viewportWidth <= 0) {
      return;
    }

    const contentWidth = getRectsContentWidth(rects);
    const itemCenter = currentLeft - getRectLeft(rects[0]) + currentWidth / 2;
    const maxScrollLeft = Math.max(0, contentWidth - viewportWidth);
    scrollLeft.value = Math.max(0, Math.min(itemCenter - viewportWidth / 2, maxScrollLeft));
  });
};

/**
 * 检查 tabs 内容是否超出 scroll-view 可视区域，并更新 `isOverflow`。
 *
 * 判定策略：
 * 1) 读取 `.tsm-tabs-scroll` 的可视宽度 viewportWidth。
 * 2) 读取所有 `.tsm-tabs-nav-item` 的 rect，取首项 left 与末项 right 的跨度作为内容宽度。
 *    - 该方式可覆盖 tag 模式下的 `gap` 间距，不会像“仅累加 width”那样漏算间隙。
 * 3) 用 `contentWidth > viewportWidth` 得出是否溢出。
 *
 * 兜底规则：
 * - 当 rect 列表为空、或 viewportWidth 无效（<=0）时，按“不溢出”处理。
 * - 这样可避免布局尚未稳定阶段出现误判抖动或异常状态。
 */
const checkOverflow = () => {
  const query = uni.createSelectorQuery();
  const scopedQuery = instanceProxy ? query.in(instanceProxy as any) : query;
  scopedQuery.select('.tsm-tabs-scroll').boundingClientRect();
  scopedQuery.selectAll('.tsm-tabs-nav-item').boundingClientRect();
  scopedQuery.exec((res: any) => {
    const scrollRect = res && res[0];
    const rects = (res && res[1]) as any[];
    const viewportWidth = Number(scrollRect && scrollRect.width) || 0;
    if (!(rects && rects.length > 0 && viewportWidth > 0)) {
      isOverflow.value = false;
      return;
    }
    // 溢出判断同样按首尾坐标跨度计算，避免仅累加 width 时遗漏 gap。
    const contentWidth = getRectsContentWidth(rects);
    isOverflow.value = contentWidth > viewportWidth;
  });
};

const animation = (x: number, duration: number) => {
  // #ifdef APP-NVUE
  const ref = internalInstance?.ctx?.$refs['tsm-tabs-nav-line'];
  if (ref) {
    nvueAnimation.transition(ref, {
      styles: {
        transform: `translateX(${x}px)`,
      },
      duration,
    });
  }
  // #endif
};

const handleTabClick = (item: any, index: number) => {
  if (item.disabled) {
    return;
  }
  innerCurrent.value = index;
  emit('update:current', index);
  emit('click', index);
  emit('change', index);
  nextTick(() => updateLinePosition());
};

const handleListIconClick = () => {
  emit('list-click');
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-tabs {
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 0.5px solid var(--tsm-color-border-secondary);
}

.tsm-tabs-scroll {
  flex: 1;
  overflow: auto;
  white-space: nowrap;
  height: 100%;
}

.tsm-tabs-nav {
  display: flex;
  position: relative;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.tsm-tabs-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-shrink: 0;
  padding: var(--tsm-spacing-xl);
  box-sizing: border-box;
}

.tsm-tabs-nav-item--active {
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tabs-nav-item--active .tsm-tabs-nav-text {
  color: var(--tsm-color-text-primary);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tabs-nav-item--disabled {
  color: var(--tsm-color-text-quaternary);
}

.tsm-tabs-nav-text {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.tsm-tabs--equal .tsm-tabs-nav-text {
  text-overflow: ellipsis;
}

.tsm-tabs-nav-line {
  position: absolute;
  bottom: 0;
  width: 16px;
  height: 3px;
  border-radius: var(--tsm-radius-full);
  background: var(--tsm-color-primary);
}

.tsm-tabs-list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 100%;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.tsm-tabs--equal .tsm-tabs-nav-item {
  flex: 1;
  min-width: 0;
}

.tsm-tabs--large {
  height: 48px;
}

.tsm-tabs--large .tsm-tabs-nav-text {
  font-size: var(--tsm-font-size-text-l);
}

.tsm-tabs--small {
  height: 40px;
}

.tsm-tabs--small .tsm-tabs-nav-text {
  font-size: var(--tsm-font-size-text-m);
}

.tsm-tabs--scrollable .tsm-tabs-nav-item {
  flex: none;
}

.tsm-tabs--scrollable .tsm-tabs-nav-text {
  font-size: var(--tsm-font-size-text-l);
}

.tsm-tabs--scrollable .tsm-tabs-nav-item--active .tsm-tabs-nav-text {
  color: var(--tsm-color-text-primary);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tabs--equidistant .tsm-tabs-nav-item {
  flex: none;
}

.tsm-tabs--tag .tsm-tabs-nav {
  gap: var(--tsm-spacing-s);
}

.tsm-tabs--tag .tsm-tabs-nav-item {
  padding: 0 var(--tsm-spacing-m);
  height: auto;
  border-radius: 100px;
  background: var(--tsm-color-bg-tertiary);
}

.tsm-tabs--tag .tsm-tabs-nav-text {
  color: var(--tsm-color-text-primary);
}

.tsm-tabs--tag .tsm-tabs-nav-item--active {
  background: var(--tsm-color-primary-bg);
}

.tsm-tabs--tag .tsm-tabs-nav-item--active .tsm-tabs-nav-text {
  color: var(--tsm-color-text-primary);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tabs--tag .tsm-tabs-nav-line {
  display: none;
}

.tsm-tabs--tag.tsm-tabs--large .tsm-tabs-nav-item {
  height: 32px;
}

.tsm-tabs--tag.tsm-tabs--large .tsm-tabs-nav-text {
  font-size: var(--tsm-font-size-text-m);
}

.tsm-tabs--tag.tsm-tabs--small .tsm-tabs-nav-item {
  height: 26px;
}

.tsm-tabs--tag.tsm-tabs--small .tsm-tabs-nav-text {
  font-size: var(--tsm-font-size-text-s);
}
</style>
