<template>
  <div class="tree-select-transfer-demo">
    <header class="tst-demo-header">
      <h3>tree-select-transfer — 树形穿梭框</h3>
      <p>左侧树多选 → 右侧已选列表，支持搜索、单条删除、可选上限提示。</p>
    </header>
    <div class="tst-demo-stage">
      <el-card class="tst-card">
        <template #header>
          <div class="tst-card-header">
            <span>基础用法（组件内置 mock 树）</span>
            <el-tag size="small" type="info">v-model: {{ selected.length }} 项</el-tag>
          </div>
        </template>
        <div class="tst-frame">
          <tree-select-transfer v-model="selected" :limit="5" />
        </div>
      </el-card>

      <el-card class="tst-card">
        <template #header><span>已选 ID</span></template>
        <pre class="tst-pre">{{ selected.length ? selected.join(', ') : '(空)' }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElCard, ElTag } from 'element-plus';
import { TreeSelectTransfer } from '../../../components/tree-select-transfer';

const selected = ref<number[]>([]);

defineOptions({ name: 'TreeSelectTransferDemo' });
</script>

<style lang="less" scoped>
.tree-select-transfer-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tst-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tst-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: auto;
  }

  .tst-card { width: 100%; }
  .tst-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tst-frame {
    height: 360px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
  }
  .tst-pre {
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.6;
    color: #303133;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
