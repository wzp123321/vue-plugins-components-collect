<template>
  <te-workflow-button
    tenant-id="700"
    :task-instance-id="tid"
    :processInstanceId="pid"
    :axios="axiosInstance"
    :identity-type="['TODO']"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import TeWorkflowButton from '@ts-web-package/components/lib/te-workflow/src/workflow-button.vue';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
const tid = ref('');
const pid = ref('789');
onMounted(() => {});
</script>

<style scoped lang="less"></style>
