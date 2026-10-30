<template>
  <el-card>
    <template #header>③ 请求重试（自动重试 3 次）</template>
    <div class="demo-section">
      <el-button type="primary" :loading="retryLoading" @click="doRetry">
        发起会失败的请求（自动重试）
      </el-button>
      <div class="retry-log">
        <div v-for="(log, i) in retryLogs" :key="i" :class="['log-line', log.type]">
          {{ log.msg }}
        </div>
      </div>
    </div>
    <pre class="code-block">{{ retryCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { useRetryRequest } from '../hooks/useRetryRequest';
import { retryCode } from '../code-samples';

defineOptions({ name: 'RetryRequestCard' });

const { retryLoading, retryLogs, doRetry } = useRetryRequest();
</script>

<style lang="less" scoped>
.demo-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.retry-log {
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.log-line {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: var(--ai-radius-xs);
  &.info {
    background: #f0f9ff;
    color: #409eff;
  }
  &.warning {
    background: #fdf6ec;
    color: #e6a23c;
  }
  &.success {
    background: #f0f9eb;
    color: #67c23a;
  }
  &.error {
    background: #fef0f0;
    color: #f56c6c;
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
