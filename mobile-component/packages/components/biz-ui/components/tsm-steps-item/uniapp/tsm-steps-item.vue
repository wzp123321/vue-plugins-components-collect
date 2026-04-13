/** * StepsItem 步骤项组件 * @description 步骤项组件，用于显示单个步骤 */
<template>
  <view class="tsm-steps-item" :class="bemClass" :style="customStyle">
    <view class="tsm-steps-item__icon">
      <icon-setting />
      <view v-else class="tsm-steps-item__dot" :style="{ backgroundColor: iconColor }"></view>
    </view>
    <view class="tsm-steps-item__content">
      <text class="tsm-steps-item__title">{{ title }}</text>
      <text v-if="description" class="tsm-steps-item__desc">{{ description }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { StepsItemProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<StepsItemProps>(), defaultProps);

const stepsContext = inject('stepsContext', null);

const status = computed(() => {
  if (!stepsContext) return 'inactive';
  return 'inactive';
});

const iconColor = computed(() => {
  return stepsContext?.props.activeColor || '#2979ff';
});

const bemClass = computed(() => {
  return bem('steps-item', [status.value], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-steps-item {
  display: flex;
  align-items: flex-start;
}

.tsm-steps-item__icon {
  margin-right: 8px;
}

.tsm-steps-item__dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.tsm-steps-item__content {
  flex: 1;
}

.tsm-steps-item__title {
  font-size: 14px;
  color: #303133;
}

.tsm-steps-item__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
