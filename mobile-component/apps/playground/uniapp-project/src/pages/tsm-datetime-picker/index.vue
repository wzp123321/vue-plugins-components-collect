<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">DatetimePicker 日期时间选择器</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法（日期）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayDate || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button type="primary" size="small" @click="openDatePicker">选择日期</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">时间选择</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayTime || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button type="info" size="small" @click="openTimePicker">选择时间</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">日期时间选择</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayDatetime || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button type="primary" size="small" @click="openDatetimePicker">选择日期时间</tsm-button>
        </view>
      </view>

      <!-- 日期选择器 -->
      <tsm-datetime-picker
        mode="date"
        :show="showDatePicker"
        :value="dateValue"
        @confirm="onDateConfirm"
        @cancel="onDateCancel"
        @close="onDateClose"
        @update:value="onDateUpdate"
      />

      <!-- 时间选择器 -->
      <tsm-datetime-picker
        mode="time"
        :show="showTimePicker"
        :value="timeValue"
        @confirm="onTimeConfirm"
        @cancel="onTimeCancel"
        @close="onTimeClose"
        @update:value="onTimeUpdate"
      />

      <!-- 日期时间选择器 -->
      <tsm-datetime-picker
        mode="datetime"
        :show="showDatetimePicker"
        :value="datetimeValue"
        @confirm="onDatetimeConfirm"
        @cancel="onDatetimeCancel"
        @close="onDatetimeClose"
        @update:value="onDatetimeUpdate"
      />
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showDatePicker = ref(false);
const showTimePicker = ref(false);
const showDatetimePicker = ref(false);

const dateValue = ref<string | number>('');
const timeValue = ref<string | number>('');
const datetimeValue = ref<string | number>('');

const displayDate = ref('');
const displayTime = ref('');
const displayDatetime = ref('');

const openDatePicker = () => {
  showDatePicker.value = true;
};

const openTimePicker = () => {
  showTimePicker.value = true;
};

const openDatetimePicker = () => {
  showDatetimePicker.value = true;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTime = (date: Date) => {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
};

const onDateUpdate = (value: Date) => {
  dateValue.value = value.getTime();
};

const onTimeUpdate = (value: Date) => {
  timeValue.value = value.getTime();
};

const onDatetimeUpdate = (value: Date) => {
  datetimeValue.value = value.getTime();
};

const onDateConfirm = (value: Date) => {
  displayDate.value = formatDate(value);
  showDatePicker.value = false;
};

const onTimeConfirm = (value: Date) => {
  displayTime.value = formatTime(value);
  showTimePicker.value = false;
};

const onDatetimeConfirm = (value: Date) => {
  displayDatetime.value = `${formatDate(value)} ${formatTime(value)}`;
  showDatetimePicker.value = false;
};

const onDateCancel = () => {
  showDatePicker.value = false;
};

const onTimeCancel = () => {
  showTimePicker.value = false;
};

const onDatetimeCancel = () => {
  showDatetimePicker.value = false;
};

const onDateClose = () => {
  showDatePicker.value = false;
};

const onTimeClose = () => {
  showTimePicker.value = false;
};

const onDatetimeClose = () => {
  showDatetimePicker.value = false;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 12px 12px 6px;
  margin-bottom: 12px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 16px 14px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #111827;
}

.demo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.demo-row__label {
  font-size: 20px;
  color: #6b7280;
}

.demo-row__value {
  font-size: 20px;
  color: #111827;
}

.demo-actions {
  margin-top: 4px;
}
</style>
