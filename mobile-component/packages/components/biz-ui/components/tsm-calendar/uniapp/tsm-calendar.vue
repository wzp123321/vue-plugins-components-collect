/** * Calendar 日历组件 * @description 日历组件，用于选择日期 */
<template>
  <tsm-popup mode="bottom" :show="show" :closeOnClickOverlay="false" :safeAreaInsetBottom="true" @close="onClose">
    <view class="tsm-calendar" :class="bemClass" :style="customStyle">
      <view class="tsm-calendar__header">
        <text class="tsm-calendar__title">{{ title }}</text>
      </view>
      <view class="tsm-calendar__weekdays">
        <text class="tsm-calendar__weekday" v-for="day in weekdays" :key="day">{{ day }}</text>
      </view>
      <view class="tsm-calendar__body">
        <view
          class="tsm-calendar__day"
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="getDayClass(day)"
          @tap="selectDay(day)"
        >
          <text>{{ day.day }}</text>
        </view>
      </view>
      <view v-if="showConfirm" class="tsm-calendar__footer">
        <button class="tsm-calendar__confirm" @tap="onConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CalendarProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<CalendarProps>(), defaultProps);

const emit = defineEmits<{
  confirm: [value: string];
  close: [];
  change: [value: string];
}>();

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const selectedDate = ref(props.value);

const bemClass = computed(() => {
  return bem('calendar', [], [], props.customClass);
});

const getDayClass = (day: any) => {
  return bem('calendar__day', [
    day.disabled ? 'disabled' : '',
    day.selected ? 'selected' : '',
    day.otherMonth ? 'other-month' : '',
  ]);
};

const calendarDays = computed(() => {
  const now = selectedDate.value ? new Date(selectedDate.value) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: any[] = [];

  // 添加上个月的日期
  const startWeekday = firstDay.getDay();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      disabled: true,
      otherMonth: true,
      selected: false,
    });
  }

  // 添加当月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split('T')[0];
    const isDisabled = isDateDisabled(dateStr);
    days.push({
      day: i,
      date: dateStr,
      disabled: isDisabled,
      otherMonth: false,
      selected: dateStr === selectedDate.value,
    });
  }

  // 添加下个月的日期
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      disabled: true,
      otherMonth: true,
      selected: false,
    });
  }

  return days;
});

const isDateDisabled = (dateStr: string) => {
  if (props.minDate && dateStr < props.minDate) return true;
  if (props.maxDate && dateStr > props.maxDate) return true;
  return false;
};

const selectDay = (day: any) => {
  if (day.disabled) return;
  selectedDate.value = day.date;
  emit('change', day.date);
};

const onConfirm = () => {
  emit('confirm', selectedDate.value);
  emit('close');
};

const onClose = () => {
  emit('close');
};

watch(
  () => props.value,
  newVal => {
    selectedDate.value = newVal;
  }
);
</script>

<style scoped lang="scss">
.tsm-calendar {
  background-color: #ffffff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.tsm-calendar__header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.tsm-calendar__title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.tsm-calendar__weekdays {
  display: flex;
  padding: 8px 0;
}

.tsm-calendar__weekday {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.tsm-calendar__body {
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px 8px;
}

.tsm-calendar__day {
  width: 14.28%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
}

.tsm-calendar__day--disabled {
  color: #c8c9cc;
  cursor: not-allowed;
}

.tsm-calendar__day--selected {
  background-color: #2979ff;
  color: #ffffff;
  border-radius: 50%;
}

.tsm-calendar__day--other-month {
  color: #c8c9cc;
}

.tsm-calendar__footer {
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
}

.tsm-calendar__confirm {
  background-color: #2979ff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}
</style>
