/** * CollapseItem 折叠面板项组件 * @description 折叠面板项组件，用于显示折叠面板内容 */
<template>
  <view class="tsm-collapse-item" :class="bemClass" :style="customStyle">
    <view class="tsm-collapse-item__header" @tap="onToggle">
      <text class="tsm-collapse-item__title">{{ title }}</text>
      <icon-setting />
    </view>
    <view v-if="expanded" class="tsm-collapse-item__content">
      <slot>{{ content }}</slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { CollapseItemProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * CollapseItem 组件 Props
 * @property {string|number} name - 面板名称
 * @property {string} title - 面板标题
 * @property {string} content - 面板内容
 * @property {boolean} disabled - 是否禁用
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<CollapseItemProps>(), defaultProps);

const collapseContext = inject('collapseContext', null);

const expanded = computed(() => {
  if (!collapseContext) return false;
  const value = collapseContext.props.value;
  if (Array.isArray(value)) {
    return value.includes(props.name);
  }
  return value === props.name;
});

const bemClass = computed(() => {
  return bem('collapse-item', [], [['disabled', props.disabled]], props.customClass);
});

const onToggle = () => {
  if (props.disabled || !collapseContext) return;
  collapseContext.toggle(props.name);
};
</script>

<style scoped lang="scss">
.tsm-collapse-item {
  border-bottom: 1px solid #ebedf0;
}

.tsm-collapse-item--disabled {
  opacity: 0.5;
}

.tsm-collapse-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: #ffffff;
}

.tsm-collapse-item__title {
  font-size: 14px;
  color: #303133;
}

.tsm-collapse-item__content {
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  background-color: #ffffff;
}
</style>
