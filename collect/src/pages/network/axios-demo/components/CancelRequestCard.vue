<template>
  <el-card>
    <template #header>② AbortController 请求取消</template>
    <div class="demo-section">
      <el-button type="warning" :disabled="reqRunning" @click="startLongReq">发起长请求</el-button>
      <el-button type="danger" :disabled="!reqRunning" @click="cancelReq">取消请求</el-button>
      <div v-if="cancelStatus" class="result-box" :class="cancelStatus.type">
        {{ cancelStatus.msg }}
      </div>
    </div>
    <pre class="code-block">{{ cancelCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { useCancelRequest } from '../hooks/useCancelRequest';
import { cancelCode } from '../code-samples';

defineOptions({ name: 'CancelRequestCard' });

const { reqRunning, cancelStatus, startLongReq, cancelReq } = useCancelRequest();
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
  &.warning {
    background: #fdf6ec;
    color: #e6a23c;
    border-color: #f5dab1;
  }
  &.error {
    background: #fef0f0;
    color: #f56c6c;
    border-color: #fde2e2;
  }
  &.success {
    background: #f0f9eb;
    color: #67c23a;
    border-color: #c2e7b0;
  }
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
