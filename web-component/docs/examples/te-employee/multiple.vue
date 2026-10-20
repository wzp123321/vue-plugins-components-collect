<template>
  <div @click="visible = true">点击打开选择弹窗</div>

  <te-employee
    v-model:visible="visible"
    v-model:selected="selected"
    :axiosInstance="axiosInstance"
    tenantId="700"
    multiple
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TeEmployee } from '@ts-web-package/components/lib/te-employee';
import axios from 'axios';

const visible = ref(false);
const selected = ref([]);
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
</script>

<style scoped lang="less"></style>
