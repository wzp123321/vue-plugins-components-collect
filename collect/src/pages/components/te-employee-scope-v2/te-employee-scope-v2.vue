<template>
  <div class="te-employee-scope-v2-demo">
    <header class="tes-demo-header">
      <h3>te-employee-scope-v2 — 员工范围选择器（v2）</h3>
      <p>套娃组合：员工 + 群组两个 tab，可同时输出 employeeIds + groupIds。</p>
    </header>
    <div class="tes-demo-stage">
      <el-card>
        <template #header><span>综合选择</span></template>
        <te-employee-scope-v2 v-model="scope" @change="onChange" />
        <pre class="tes-pre">已选:\n{{ JSON.stringify(scope, null, 2) }}</pre>
      </el-card>

      <el-card>
        <template #header><span>联动演示：选员工后，切换到群组 tab 只显示含该员工的组</span></template>
        <te-employee-scope-v2 v-model="scope2" />
        <pre class="tes-pre">{{ JSON.stringify(scope2, null, 2) }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElCard } from 'element-plus';
import { TeEmployeeScopeV2, type ScopeValue } from '../../../components/te-employee-scope';

const scope = ref<ScopeValue>({ employeeIds: ['u-1', 'u-2'], groupIds: ['g-1'] });
const scope2 = ref<ScopeValue>({ employeeIds: [], groupIds: [] });

const onChange = (v: ScopeValue) => console.log('change', v);

defineOptions({ name: 'TeEmployeeScopeV2Demo' });
</script>

<style lang="less" scoped>
.te-employee-scope-v2-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tes-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tes-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tes-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
}
</style>
