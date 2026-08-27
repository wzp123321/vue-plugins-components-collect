<template>
  <div class="axios-demo-page">
    <h5>Axios 请求层封装演示</h5>
    <el-alert type="info" :closable="false" class="top-alert">
      展示 Axios 请求封装的核心模式：请求/响应拦截、重试机制、请求取消、并发控制、上传进度。
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="12">
        <BasicRequestCard />
      </el-col>
      <el-col :span="12">
        <CancelRequestCard />
      </el-col>

      <el-col :span="12" class="mt-16">
        <RetryRequestCard />
      </el-col>
      <el-col :span="12" class="mt-16">
        <ConcurrentRequestCard />
      </el-col>

      <el-col :span="24" class="mt-16">
        <TokenRefreshCard />
      </el-col>
      <el-col :span="24" class="mt-16">
        <FullRequestCodeCard />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import BasicRequestCard from './components/BasicRequestCard.vue';
import CancelRequestCard from './components/CancelRequestCard.vue';
import RetryRequestCard from './components/RetryRequestCard.vue';
import ConcurrentRequestCard from './components/ConcurrentRequestCard.vue';
import TokenRefreshCard from './components/TokenRefreshCard.vue';
import FullRequestCodeCard from './components/FullRequestCodeCard.vue';

defineOptions({ name: 'AxiosDemo' });
</script>

<style lang="less" scoped>
.axios-demo-page {
  padding: 20px;
  overflow-y: auto;
}
.top-alert {
  margin-bottom: 20px;
}
.mt-16 {
  margin-top: 16px;
}
</style>
