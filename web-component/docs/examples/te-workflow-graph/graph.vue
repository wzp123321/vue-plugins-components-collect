<template>
  <te-workflow-graph tenant-id="700" process-instance-id="112233" :axios="axiosInstance" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import TeWorkflowGraph from '@ts-web-package/components/lib/te-workflow/src/workflow-graph-doc.vue';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
onMounted(() => {});
</script>

<style scoped lang="less"></style>
