/** * PickerColumn 选择器列组件 * @description 选择器列组件，用于显示单列选项 */
<template>
  <view class="tsm-picker-column" :class="[customClass]" :style="pickerColumnStyle">
    <picker-view class="tsm-picker-column__view" :value="[valueIndex]" @change="onChange">
      <picker-view-column>
        <view v-for="(item, index) in values" :key="index" class="tsm-picker-column__item">
          {{ getItemText(item) }}
        </view>
      </picker-view-column>
    </picker-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PickerColumnProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * PickerColumn 组件 Props
 * @property {array} values - 选项列表
 * @property {number} valueIndex - 当前选中项索引
 * @property {string} keyName - 选项显示字段
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<PickerColumnProps>(), defaultProps);

const emit = defineEmits<{
  change: [index: number, value: any];
}>();

const pickerColumnStyle = computed(() => {
  return addStyle({
    height: '200px',
    ...props.customStyle,
  });
});

const getItemText = (item: any) => {
  if (typeof item === 'object' && item !== null) {
    return item[props.keyName] || '';
  }
  return String(item);
};

const onChange = (e: any) => {
  const index = e.detail.value[0];
  emit('change', index, props.values[index]);
};
</script>

<style scoped lang="scss">
.tsm-picker-column {
  height: 200px;
}

.tsm-picker-column__view {
  height: 100%;
}

.tsm-picker-column__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 14px;
  color: #303133;
}
</style>
