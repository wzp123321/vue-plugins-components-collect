<template>
  <el-card>
    <template #header>⑤ Token 失效自动刷新 + 重试（并发安全）</template>
    <div class="demo-section">
      <div class="token-state">
        <div class="token-item">
          <span class="token-label">Access Token:</span>
          <el-tag :type="accessToken ? 'success' : 'info'" size="small">
            {{ accessToken ? '...' + accessToken.slice(-8) : '未登录' }}
          </el-tag>
        </div>
        <div class="token-item">
          <span class="token-label">Refresh Token:</span>
          <el-tag :type="refreshToken ? 'warning' : 'info'" size="small">
            {{ refreshToken ? '****' + refreshToken.slice(-4) : '无' }}
          </el-tag>
        </div>
        <el-button size="small" @click="resetTokens">重置</el-button>
      </div>
      <div class="action-row">
        <el-button type="primary" :loading="tokenRefreshLoading" @click="doTokenRefresh">
          ① 模拟 401 → 自动刷新 token → 重试
        </el-button>
        <el-button type="warning" :loading="multiTokenLoading" @click="doMultipleTokenRefresh">
          ② 并发 3 个请求（只刷新 1 次 token）
        </el-button>
        <el-button type="danger" :loading="refreshExpiredLoading" @click="doRefreshTokenExpired">
          ③ refreshToken 也失效 → 跳转登录
        </el-button>
      </div>
      <div class="token-log">
        <div v-for="(log, i) in tokenLogs" :key="i" :class="['log-line', log.type]">
          <span class="log-time">{{ log.time }}</span>
          {{ log.msg }}
        </div>
        <div v-if="!tokenLogs.length" class="log-empty">点击上方按钮查看完整流程</div>
      </div>
    </div>
    <pre class="code-block">{{ tokenRefreshCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { useTokenRefreshDemo } from '../hooks/useTokenRefreshDemo';
import { tokenRefreshCode } from '../code-samples';

defineOptions({ name: 'TokenRefreshCard' });

const {
  tokenRefreshLoading,
  multiTokenLoading,
  refreshExpiredLoading,
  tokenLogs,
  accessToken,
  refreshToken,
  resetTokens,
  doTokenRefresh,
  doMultipleTokenRefresh,
  doRefreshTokenExpired,
} = useTokenRefreshDemo();
</script>

<style lang="less" scoped>
.demo-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.token-state {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  flex-wrap: wrap;
  .token-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .token-label {
    color: #606266;
    font-weight: 500;
  }
}
.token-log {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding: 4px;
  background: #1e1e2e;
  border-radius: 6px;
  .log-time {
    color: #6c7086;
    font-size: 11px;
    margin-right: 6px;
    font-family: monospace;
  }
  .log-empty {
    color: #6c7086;
    font-size: 12px;
    text-align: center;
    padding: 20px;
  }
  .log-line {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    font-family: monospace;
    &.info {
      background: rgba(64, 158, 255, 0.15);
      color: #74c0fc;
    }
    &.warning {
      background: rgba(230, 162, 60, 0.15);
      color: #f9e2af;
    }
    &.success {
      background: rgba(103, 194, 58, 0.15);
      color: #a6e3a1;
    }
    &.error {
      background: rgba(245, 108, 108, 0.15);
      color: #f38ba8;
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
