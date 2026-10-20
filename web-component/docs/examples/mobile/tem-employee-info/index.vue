<template>
  <view class="container">
    <uni-section title="ref方式打开" type="line" padding>
      <tem-employee-info
        ref="employeeInfoRef"
        :id="empId"
        :http="http"
        tenant-id="700"
      />
      <div @click="employeeInfoRef.open()">tem-employee-info</div>
    </uni-section>

    <uni-section title="函数方式打开" type="line" padding>
      <div @click="handleOpen">点击tem-employee-info</div>
    </uni-section>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import {
//   TemEmployeeInfo,
//   TemEmployeeInfoUtil,
// } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import Request from 'luch-request';

const http = new Request({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
const empId = ref('123');
const employeeInfoRef = ref();

const handleOpen = () => TemEmployeeInfoUtil.open(empId.value, '700', http);
</script>

<style lang="scss" scoped></style>
