/** * BreadCrumb 面包屑 * @description * - 支持单项图标 + 文本展示 * - 文本超长支持中间/末尾省略 * -
支持横向滚动/换行两种布局模式 * - 支持点击事件（抛出当前项和索引） * - 最后一项高亮展示（图标+文字均为主色） */
<template>
  <!-- 横向滚动场景：overflowMode = 'scroll' -->
  <scroll-view
    v-if="props.overflowMode === 'scroll'"
    class="tsm-bread-crumb-container"
    :class="props.customClass"
    :style="wrapperStyle"
    scroll-x
  >
    <view class="tsm-bread-crumb tsm-bread-crumb--scroll">
      <!-- 逐项渲染面包屑项 -->
      <template v-for="(item, index) in props.items" :key="`${getItemText(item)}-${index}`">
        <!-- 分隔符（从第二项开始显示） -->
        <view v-if="index > 0" class="tsm-bread-crumb-separator">
          <icon-right />
        </view>

        <view
          class="tsm-bread-crumb-item"
          :class="{ 'tsm-bread-crumb-item--last': isLastItem(index) }"
          @tap="handleItemClick(item, index)"
        >
          <!-- 单项前置 icon，是否展示由 showItemIcon 控制 -->
          <view v-if="props.showItemIcon" class="tsm-bread-crumb-item-icon">
            <icon-home :color="getItemIconStyle(index)" />
          </view>
          <!-- 文本区域，支持中间/末尾省略 -->
          <text class="tsm-bread-crumb-label" :class="{ 'tsm-bread-crumb-label--end': props.ellipsisMode === 'end' }">
            {{ getDisplayText(getItemText(item)) }}
          </text>
        </view>
      </template>
    </view>
  </scroll-view>

  <view v-else class="tsm-bread-crumb-container" :class="props.customClass" :style="wrapperStyle">
    <!-- 换行场景：overflowMode = 'wrap' -->
    <view class="tsm-bread-crumb tsm-bread-crumb--wrap">
      <template v-for="(item, index) in props.items" :key="`${getItemText(item)}-${index}`">
        <view v-if="index > 0" class="tsm-bread-crumb-separator">
          <icon-right />
        </view>

        <view
          class="tsm-bread-crumb-item"
          :class="{ 'tsm-bread-crumb-item--last': isLastItem(index) }"
          @tap="handleItemClick(item, index)"
        >
          <view v-if="props.showItemIcon" class="tsm-bread-crumb-item-icon">
            <icon-home :color="getItemIconStyle(index)" />
          </view>
          <text class="tsm-bread-crumb-label" :class="{ 'tsm-bread-crumb-label--end': props.ellipsisMode === 'end' }">
            {{ getDisplayText(getItemText(item)) }}
          </text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BreadcrumbItem, BreadCrumbProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * 组件入参，类型为 BreadCrumbProps
 * - 通过 withDefaults 结合 defaultProps 提供默认值
 */
const props = withDefaults(defineProps<BreadCrumbProps>(), defaultProps);

/**
 * 事件定义
 * - click：点击某一项时触发，抛出 item 和 index
 */
const emit = defineEmits<{
  click: [item: BreadcrumbItem, index: number];
}>();

/**
 * 外层容器样式
 * - 支持 customStyle 透传
 * - 通过 addStyle 兼容字符串/对象等格式
 */
const wrapperStyle = computed(() => {
  return addStyle({ ...props.customStyle });
});

/**
 * 统一从 item 中取展示文本
 * - 优先使用 props.itemTextKey 对应的字段
 * - 不存在时返回空字符串
 */
const getItemText = (item: BreadcrumbItem) => {
  const value = item?.[props.itemTextKey];
  return value === undefined || value === null ? '' : String(value);
};

/**
 * 是否为最后一个面包屑
 * - 用于控制高亮样式、icon 颜色等
 */
const isLastItem = (index: number) => {
  return index === props.items.length - 1;
};

/**
 * 获取单项 icon 颜色
 * - 最后一个为主色，其余为次级文本色
 */
const getItemIconStyle = (index: number) => {
  return isLastItem(index) ? 'var(--tsm-color-text-primary)' : 'var(--tsm-color-text-secondary)';
};

/**
 * 中间省略逻辑
 * - maxLength：超出后触发省略
 * - headLength/tailLength：保留前后字符数量
 */
const middleEllipsis = (text: string) => {
  const maxLength = 12;
  if (text.length <= maxLength) return text;
  const headLength = 5;
  const tailLength = 4;
  return `${text.slice(0, headLength)}...${text.slice(-tailLength)}`;
};

/**
 * 根据 ellipsisMode 返回展示文案
 * - middle：中间省略
 * - end：末尾省略（由 CSS 控制，仅返回原文）
 */
const getDisplayText = (text: string) => {
  if (props.ellipsisMode === 'middle') {
    return middleEllipsis(text);
  }
  return text;
};

/**
 * 单项点击事件
 * - 直接透传 item 和 index，交给外部处理路由跳转等逻辑
 */
const handleItemClick = (item: BreadcrumbItem, index: number) => {
  emit('click', item, index);
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-bread-crumb {
  display: flex;
  align-items: center;

  // 横向滚动模式：内部使用 inline-flex + min-width: 100% 保证内容可滚动
  &--scroll {
    display: inline-flex;
    min-width: 100%;
    flex-wrap: nowrap;
  }

  // 换行模式：允许多行展示，行间距使用统一 token
  &--wrap {
    flex-wrap: wrap;
    row-gap: var(--tsm-spacing-xs);
  }

  // 单项容器
  &-item {
    max-width: 160px;
    min-width: 0;
    display: inline-flex;
    align-items: center;

    // 最后一项文字高亮
    &--last {
      .tsm-bread-crumb-label {
        color: var(--tsm-color-text-primary);
        font-weight: var(--tsm-font-weight-bold);
      }
    }
  }

  // 单项前置 icon 容器
  &-item-icon {
    margin-right: var(--tsm-spacing-2xs);
    display: inline-flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  // 文本样式，限制最大宽度并开启省略
  &-label {
    max-width: 160px;
    font-size: var(--tsm-font-size-text-m);
    line-height: var(--tsm-line-height-text-m);
    white-space: nowrap;
    overflow: hidden;
    color: var(--tsm-color-text-secondary);
    font-weight: var(--tsm-font-weight-regular);

    &--end {
      text-overflow: ellipsis;
    }
  }

  // 分隔符 icon 容器
  &-separator {
    margin: 0 var(--tsm-spacing-xs);
    color: var(--tsm-color-text-secondary);
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    :deep(*) {
      color: var(--tsm-color-text-secondary);
      width: 16px;
      height: 16px;
      font-size: 16px;
      line-height: 16px;
    }
  }
}

.tsm-bread-crumb-container {
  width: 100%;
}
</style>
