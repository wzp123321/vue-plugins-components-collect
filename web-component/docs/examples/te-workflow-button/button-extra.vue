<template>
  <te-workflow-button
    tenant-id="700"
    task-instance-id="112233"
    :axios="axiosInstance"
    :identity-type="['TODO']"
    use-scene="table"
    order="left-right"
    :extra-buttons="[
      { name: '查看', code: 'view', style: 'primary' },
      { name: '投诉', code: 'tousu', style: 'primary' },
      { name: '删除', code: 'delet', style: 'primary' },
    ]"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import TeWorkflowButton from '@ts-web-package/components/lib/te-workflow/src/workflow-button.vue';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
onMounted(() => {});
</script>

<style scoped lang="less"></style>
