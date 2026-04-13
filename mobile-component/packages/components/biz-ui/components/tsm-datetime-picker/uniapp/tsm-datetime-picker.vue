/** * DatetimePicker 日期时间选择器组件 * @description 日期时间选择器组件，用于选择日期和时间 */
<template>
  <tsm-popup mode="bottom" :show="show" :closeOnClickOverlay="true" :safeAreaInsetBottom="true" @close="onClose">
    <view class="tsm-datetime-picker" :class="bemClass" :style="customStyle">
      <view class="tsm-datetime-picker__header">
        <text class="tsm-datetime-picker__cancel" @tap="onCancel">取消</text>
        <text class="tsm-datetime-picker__confirm" @tap="onConfirm">确定</text>
      </view>
      <picker-view class="tsm-datetime-picker__view" :value="pickerValue" @change="onChange">
        <picker-view-column v-if="mode !== 'time'">
          <view v-for="year in years" :key="year" class="tsm-datetime-picker__item"> {{ year }}年 </view>
        </picker-view-column>
        <picker-view-column v-if="mode !== 'time'">
          <view v-for="month in months" :key="month" class="tsm-datetime-picker__item"> {{ month }}月 </view>
        </picker-view-column>
        <picker-view-column v-if="mode !== 'time'">
          <view v-for="day in days" :key="day" class="tsm-datetime-picker__item"> {{ day }}日 </view>
        </picker-view-column>
        <picker-view-column v-if="mode !== 'date'">
          <view v-for="hour in hours" :key="hour" class="tsm-datetime-picker__item"> {{ hour }}时 </view>
        </picker-view-column>
        <picker-view-column v-if="mode !== 'date'">
          <view v-for="minute in minutes" :key="minute" class="tsm-datetime-picker__item"> {{ minute }}分 </view>
        </picker-view-column>
      </picker-view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DatetimePickerProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * DatetimePicker 组件 Props
 * @property {string|number} value - 当前选中值
 * @property {string} mode - 选择器类型 (date | time | datetime)
 * @property {number} minDate - 最小可选日期
 * @property {number} maxDate - 最大可选日期
 * @property {boolean} show - 是否显示
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<DatetimePickerProps>(), defaultProps);

const emit = defineEmits<{
  confirm: [value: Date];
  cancel: [];
  close: [];
  'update:value': [value: Date];
}>();

const bemClass = computed(() => {
  return bem('datetime-picker', [props.mode], [], props.customClass);
});

const years = computed(() => {
  const minYear = new Date(props.minDate).getFullYear();
  const maxYear = new Date(props.maxDate).getFullYear();
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
});

const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const pickerValue = ref([0, 0, 0, 0, 0]);

const onChange = (e: any) => {
  pickerValue.value = e.detail.value;
};

const onConfirm = () => {
  const date = new Date();
  emit('confirm', date);
  emit('update:value', date);
  emit('close');
};

const onCancel = () => {
  emit('cancel');
  emit('close');
};

const onClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.tsm-datetime-picker {
  background-color: #ffffff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}

.tsm-datetime-picker__header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.tsm-datetime-picker__cancel {
  font-size: 14px;
  color: #909399;
}

.tsm-datetime-picker__confirm {
  font-size: 14px;
  color: #2979ff;
}

.tsm-datetime-picker__view {
  height: 200px;
}

.tsm-datetime-picker__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 14px;
  color: #303133;
}
</style>
