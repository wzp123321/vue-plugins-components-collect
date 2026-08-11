<template>
  <el-card>
    <template #header>⚙️ 完整 request.ts 封装思路</template>
    <pre class="code-block">{{ fullRequestCode }}</pre>
  </el-card>
</template>

<script lang="ts" setup>
import { fullRequestCode } from '../code-samples';

defineOptions({ name: 'FullRequestCodeCard' });
</script>

<style lang="less" scoped>
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
