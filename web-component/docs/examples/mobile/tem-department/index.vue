<template>
  <view class="container">
    <uni-section title="单选" type="line" padding>
      <div @click="employeeRef.open()">点击打开</div>
      <tem-employee
        ref="employeeRef"
        v-model="value"
        :http="http"
        tenant-id="700"
      />
    </uni-section>

    <uni-section title="多选" type="line" padding>
      <div @click="employeeRef2.open()">点击打开</div>
      <tem-employee
        ref="employeeRef2"
        v-model="multipleValue"
        :http="http"
        tenant-id="700"
        multiple
      />
    </uni-section>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemEmployee } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import Request from 'luch-request';

const http = new Request({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
const employeeRef = ref<InstanceType<typeof TemEmployee>>();
const employeeRef2 = ref<InstanceType<typeof TemEmployee>>();
const value = ref<{ id: string; name?: string }[]>([]);
const multipleValue = ref<{ id: string; name?: string }[]>([]);
</script>

<style lang="scss"></style>
