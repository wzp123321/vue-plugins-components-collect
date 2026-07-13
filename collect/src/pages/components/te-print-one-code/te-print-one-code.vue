<template>
  <div class="te-print-one-code-demo">
    <header class="tpoc-demo-header">
      <h3>te-print-one-code — 一物一码打印向导</h3>
      <p>三步完成批量打码：选择资产 → 选择模板 → 确认打印</p>
    </header>
    <div class="tpoc-demo-stage">
      <el-button type="primary" @click="visible = true">打 印</el-button>

      <te-print-one-code
        v-model="visible"
        @print="onPrint"
      />

      <el-card v-if="lastPrint" class="tpoc-result">
        <template #header>最近一次打印</template>
        <pre>{{ lastPrint }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElButton, ElCard } from 'element-plus';
import { TePrintOneCode } from '../../../components/te-print-one-code';

const visible = ref(false);
const lastPrint = ref<any>(null);

const onPrint = (p: any) => {
  lastPrint.value = JSON.stringify(p, null, 2);
};

defineOptions({ name: 'TePrintOneCodeDemo' });
</script>

<style lang="less" scoped>
.te-print-one-code-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tpoc-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tpoc-demo-stage {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tpoc-result {
    pre {
      margin: 0;
      font-size: 12px;
      color: #606266;
      white-space: pre-wrap;
    }
  }
}
</style>
