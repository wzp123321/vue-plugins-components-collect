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
}
</style>
