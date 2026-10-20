<template>
  <te-employee-info :id="emp.id" :axios="axiosInstance" tenantId="700">
    <span>{{ emp.name }}</span>
  </te-employee-info>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TeEmployeeInfo } from '@ts-web-package/components/lib/te-employee-info';
import axios from 'axios';

const emp = ref({
  id: '111',
  name: '王冲冲',
});
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
</script>

<style scoped lang="less"></style>
