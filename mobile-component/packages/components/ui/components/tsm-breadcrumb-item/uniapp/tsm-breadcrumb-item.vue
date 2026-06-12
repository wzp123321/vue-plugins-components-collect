<template>
  <view class="tsm-bread-crumb-item">
    <view class="tsm-bread-crumb-item-inner">
      <!-- 单项前置 icon，是否展示由 showItemIcon 控制 -->
      <view v-if="props.showItemIcon" class="tsm-bread-crumb-item-inner-icon">
        <icon-home :size="iconSize" :color="itemIconColor" />
      </view>
      <!-- 文本区域，支持中间/末尾省略 -->
      <view class="tsm-bread-crumb-label" @tap="handleItemClick">
        <text
          class="tsm-bread-crumb-label-text"
          :class="{ 'tsm-bread-crumb-label-text--end': props.ellipsisMode === 'end' }"
        >
          {{ displayText }}
        </text>
      </view>
    </view>

    <!-- 分隔符放到文字后面 -->
    <view class="tsm-bread-crumb-separator">
      <!-- 优先使用 props 传入的分隔符 -->
      <!-- <template v-if="props.separator">
        <template v-if="typeof props.separator === 'string'">{{ props.separator }}</template>
        <component :size="iconSize" :is="props.separator" v-else />
      </template> -->
      <!-- 其次使用父组件注入的分隔符 -->
      <!-- <template v-else-if="parentSeparator">
        <template v-if="typeof parentSeparator === 'string'">{{ parentSeparator }}</template>
        <component :size="iconSize" :is="parentSeparator" v-else />
      </template> -->
      <!-- 最后使用默认的分隔符 icon -->
      <icon-right-medium :size="separatorSize" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import {
  type BreadcrumbItem,
  type BreadCrumbItemProps,
  defaultProps,
  itemIconColor,
  iconSize,
  separatorSize,
} from './props';

/**
 * 子组件入参
 */
const props = withDefaults(defineProps<BreadCrumbItemProps>(), defaultProps);

const emit = defineEmits<{
  /** 点击面包屑项时触发 */
  click: [item: BreadcrumbItem];
}>();

/**
 * 注入父组件提供的上下文
 */
// const parent = inject('tsmBreadcrumb', {
//   separator: '',
// });

// const parentSeparator = computed(() => parent.separator);

/**
 * 中间省略逻辑
 */
const middleEllipsis = (text: string) => {
  const maxLength = 12;
  if (text.length <= maxLength) {
    return text;
  }
  const headLength = 5;
  const tailLength = 4;
  return `${text.slice(0, headLength)}...${text.slice(-tailLength)}`;
};

/**
 * 计算最终显示的文本
 */
const displayText = computed(() => {
  const text = props.label || '';
  if (props.ellipsisMode === 'middle') {
    return middleEllipsis(text);
  }
  return text;
});

/**
 * 点击处理
 */
const handleItemClick = () => {
  emit('click', props.item);
};
</script>

<style scoped lang="scss">
.tsm-bread-crumb-item {
  display: flex;
  align-items: center;
  height: 40px;
}

.tsm-bread-crumb-item-inner {
  max-width: 160px;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 40px;
}

.tsm-bread-crumb-item-inner-icon {
  margin-right: var(--tsm-spacing-2xs);
  display: flex;
  align-items: center;
}

.tsm-bread-crumb-label {
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.tsm-bread-crumb-label-text {
  max-width: 160px;
  font-size: var(--tsm-font-size-text-m);
  line-height: var(--tsm-line-height-text-m);
  white-space: nowrap;
  overflow: hidden;
  color: var(--tsm-color-text-secondary);
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-bread-crumb-label-text--end {
  text-overflow: ellipsis;
}

.tsm-bread-crumb-separator {
  margin: 0 var(--tsm-spacing-xs);
  color: var(--tsm-color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
