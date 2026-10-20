<template>
  <view class="container">
    <tem-workflow-log
      tenant-id="700"
      process-instance-id="123"
      :http="http"
    />
  </view>
</template>

<script setup lang="ts">
// import { TemWorkflowLog } from '@tiansu/ts-mobile-package';
// import Request from 'luch-request';
const http = new Request({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/exampl1e',
});
</script>

<style scoped lang="less"></style>
