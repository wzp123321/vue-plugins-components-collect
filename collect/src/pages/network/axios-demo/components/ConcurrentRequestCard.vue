<template>
  <el-card>
    <template #header>④ 并发控制（最多同时 3 个请求）</template>
    <div class="demo-section">
      <el-button type="primary" :loading="concurrentLoading" @click="doConcurrent">
        发起 8 个请求（限并发 3）
      </el-button>
      <div class="concurrent-grid">
        <div
          v-for="req in concurrentReqs"
          :key="req.id"
          class="req-item"
          :class="req.status"
        >
          #{{ req.id }}
          {{
            req.status === 'pending'
              ? '等待中'
              : req.status === 'running'
                ? '请求中...'
                : req.status === 'done'
                  ? '✅ 完成'
                  : '❌ 失败'
          }}
        </div>
      </div>
    </div>
    <pre class="code-block">{{ concurrentCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { useConcurrentRequest } from '../hooks/useConcurrentRequest';
import { concurrentCode } from '../code-samples';

defineOptions({ name: 'ConcurrentRequestCard' });

const { concurrentLoading, concurrentReqs, doConcurrent } = useConcurrentRequest();
</script>

<style lang="less" scoped>
.demo-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.concurrent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 8px;
  .req-item {
    padding: 6px;
    border-radius: var(--ai-radius-xs);
    font-size: 12px;
    text-align: center;
    &.pending {
      background: #f5f7fa;
      color: #909399;
    }
    &.running {
      background: #fff7e6;
      color: #e6a23c;
    }
    &.done {
      background: #f0f9eb;
      color: #67c23a;
    }
    &.failed {
      background: #fef0f0;
      color: #f56c6c;
    }
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
