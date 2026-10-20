<template>
  <te-space-attribute
    v-model="value"
    :axios="axiosInstance"
    multiple
    tenantId="700"
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="1"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TeSpaceAttribute } from '@ts-web-package/components/lib/te-space-attribute';
import axios from 'axios';

const value = ref<string[]>([]);
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
</script>

<style scoped lang="less"></style>
