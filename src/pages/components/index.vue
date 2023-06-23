<!--
 * @Author: wanzp
 * @Date: 2023-06-06 09:00:47
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-20 15:05:17
 * @Description: Description
-->
<template>
  <div class="components common-container">
    <div class="cc-item h360">
      <YearRangePicker v-model="dates"></YearRangePicker>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import YearRangePicker from './year-range-picker/year-range-picker.vue';

const dates = ref<Date[]>([new Date(2017, 1, 1), new Date()]);
</script>
<style lang="less" scoped>
.components {
  width: 100%;
  height: 100%;

  .cc-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
