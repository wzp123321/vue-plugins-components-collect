<template>
  <tem-cell
    titleText="日期选择"
    require
    showContent
    showArrow
    @click="
      () => {
        pickerRef.show();
      }
    "
  >
    <template #content>
      <view>{{ dateValue }}</view>
      <tem-picker
        ref="pickerRef"
        :value="dateValue"
        :end="dateEndLimit"
        pickerTitle="选择日期"
        @change="
          (e) => {
            dateValue = e.detail.value;
          }
        "
        mode="date"
      >
      </tem-picker>
    </template>
  </tem-cell>
  <tem-cell
    titleText="时间选择"
    require
    showContent
    showArrow
    @click="
      () => {
        timePickerRef.show();
      }
    "
  >
    <template #content>
      <view>{{ value.planTime }}</view>
      <tem-picker
        ref="timePickerRef"
        :value="value.planTime"
        start="2025-01-14 11:00"
        :end="timeEndLimit"
        pickerTitle="选择时间"
        fields="minute"
        @change="
          (e) => {
            value.planTime = e.detail.value;
          }
        "
        mode="time"
        :timeStep="60 * 15"
      >
      </tem-picker>
    </template>
  </tem-cell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import { TemCell, TemPicker } from '@zpackage/mobile-package';

const getNext15MinuteInterval = (date: Date): Date => {
  const minutes = date.getMinutes();
  const remainder = minutes % 15;
  const additionalMinutes = 15 - remainder;
  date.setMinutes(date.getMinutes() + additionalMinutes);
  return date;
};

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const dateValue = ref('2019-11-02');
const value = ref({
  planTime: formatDateTime(getNext15MinuteInterval(new Date())),
});
const dateEndLimit = ref('');
const timeEndLimit = ref('');
const pickerRef = ref();
const timePickerRef = ref();

onMounted(() => {
  dateEndLimit.value = '2020-11-01';
  setTimeout(() => {
    timeEndLimit.value = '2025-11-01 11:02';
  }, 2000);
});
</script>

<style lang="scss"></style>
