/** * Card 卡片组件 * @description 卡片组件，用于展示内容 */
<template>
  <view class="tsm-card" :class="bemClass" :style="cardStyle">
    <view v-if="title || subTitle" class="tsm-card__header">
      <text v-if="title" class="tsm-card__title">{{ title }}</text>
      <text v-if="subTitle" class="tsm-card__sub-title">{{ subTitle }}</text>
    </view>
    <view class="tsm-card__body">
      <slot />
    </view>
    <view v-if="$slots.footer" class="tsm-card__footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CardProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<CardProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('card', [props.border ? 'border' : ''], [], props.customClass);
});

const cardStyle = computed(() => {
  return {
    borderRadius: addUnit(String(props.radius)),
    ...props.customStyle,
  };
});
</script>

<style scoped lang="scss">
.tsm-card {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;

  &--border {
    border: 1px solid #ebedf0;
  }
}

.tsm-card__header {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.tsm-card__title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.tsm-card__sub-title {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.tsm-card__body {
  padding: 16px;
}

.tsm-card__footer {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
  background-color: #f7f8fa;
}
</style>
