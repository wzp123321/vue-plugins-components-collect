<template>
  <el-card>
    <template #header>① 基础 GET/POST 请求</template>
    <div class="demo-section">
      <el-button type="primary" :loading="getLoading" @click="doGet">GET 请求</el-button>
      <el-button type="success" :loading="postLoading" @click="doPost">POST 请求</el-button>
      <div v-if="result" class="result-box">{{ result }}</div>
    </div>
    <pre class="code-block">{{ basicCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { useBasicRequest } from '../hooks/useBasicRequest';
import { basicCode } from '../code-samples';

defineOptions({ name: 'BasicRequestCard' });

const { getLoading, postLoading, result, doGet, doPost } = useBasicRequest();
</script>

<style lang="less" scoped>
.demo-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-box {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}
.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
}
</style>
