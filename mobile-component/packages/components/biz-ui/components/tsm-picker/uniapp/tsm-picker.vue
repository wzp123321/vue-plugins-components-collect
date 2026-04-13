/** * Picker 选择器组件 * @description 选择器组件，用于从列表中选择一项 */
<template>
  <tsm-popup mode="bottom" :show="show" :closeOnClickOverlay="false" :safeAreaInsetBottom="true" @close="onClose">
    <view class="tsm-picker" :class="[customClass]" :style="pickerStyleObj">
      <view class="tsm-picker__header">
        <text class="tsm-picker__cancel" @tap="onCancel">{{ cancelText }}</text>
        <text class="tsm-picker__title">{{ title }}</text>
        <text class="tsm-picker__confirm" @tap="onConfirm">{{ confirmText }}</text>
      </view>
      <picker-view class="tsm-picker__view" :value="[currentIndex]" @change="onChange">
        <picker-view-column>
          <view class="tsm-picker__item" v-for="(item, index) in displayColumns" :key="index">
            {{ getItemText(item) }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PickerProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * Picker 组件 Props
 * @property {boolean} show - 是否显示
 * @property {string} title - 选择器标题
 * @property {array} columns - 选项列表
 * @property {number} defaultIndex - 当前选中项的索引
 * @property {boolean} showCancelButton - 是否显示取消按钮
 * @property {boolean} showConfirmButton - 是否显示确认按钮
 * @property {string} cancelText - 取消按钮文字
 * @property {string} confirmText - 确认按钮文字
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<PickerProps>(), defaultProps);

const emit = defineEmits<{
  confirm: [value: any];
  cancel: [];
  close: [];
  change: [value: any];
}>();

const currentIndex = ref(props.defaultIndex);

const pickerStyleObj = computed(() => {
  return addStyle(props.customStyle || {});
});

const displayColumns = computed(() => {
  if (props.columns.length === 0) return [];
  if (Array.isArray(props.columns[0]) || (props.columns[0] && props.columns[0].values)) {
    return props.columns[0].values || props.columns[0];
  }
  return props.columns;
});

const getItemText = (item: any) => {
  if (typeof item === 'object' && item !== null) {
    return item.text || item.label || item.name || '';
  }
  return String(item);
};

const getItemValue = (item: any) => {
  if (typeof item === 'object' && item !== null) {
    return item.value !== undefined ? item.value : item;
  }
  return item;
};

const onChange = (e: any) => {
  const index = e.detail.value[0];
  currentIndex.value = index;
  const value = getItemValue(displayColumns.value[index]);
  emit('change', value);
};

const onConfirm = () => {
  const value = getItemValue(displayColumns.value[currentIndex.value]);
  emit('confirm', value);
  emit('close');
};

const onCancel = () => {
  emit('cancel');
  emit('close');
};

const onClose = () => {
  emit('close');
};

watch(
  () => props.defaultIndex,
  newVal => {
    currentIndex.value = newVal;
  }
);
</script>

<style scoped lang="scss">
.tsm-picker {
  background-color: #ffffff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.tsm-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.tsm-picker__cancel {
  color: #909399;
  font-size: 14px;
}

.tsm-picker__title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.tsm-picker__confirm {
  color: #2979ff;
  font-size: 14px;
}

.tsm-picker__view {
  height: 200px;
}

.tsm-picker__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  font-size: 14px;
  color: #303133;
}
</style>
