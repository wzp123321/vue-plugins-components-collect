<template>
  <div class="te-department-demo">
    <header class="td-demo-header">
      <h3>te-department — 部门选择器</h3>
      <p>支持多选/单选、树形、搜索、联选、已选 chip 智能 tooltip、API 策略切换</p>
    </header>
    <div class="td-demo-stage">
      <el-card>
        <template #header><span>多选模式（standard）</span></template>
        <te-department v-model="multiValue" :multiple="true" @change="onChange" />
        <pre class="td-pre">已选: {{ multiDisplay }}</pre>
      </el-card>

      <el-card>
        <template #header><span>单选模式（cloud）</span></template>
        <te-department v-model="singleValue" :multiple="false" mode="cloud" />
        <pre class="td-pre">已选: {{ singleDisplay }}</pre>
      </el-card>

      <el-card>
        <template #header><span>API 策略调用演示</span></template>
        <p>控制台查看输出</p>
        <el-button @click="onUseStrategy">调用 standard 策略</el-button>
        <el-button @click="onUseStrategyCloud">调用 cloud 策略</el-button>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton } from 'element-plus';
import { TeDepartment, getDepartmentApiByMode } from '../../../components/te-department';
import { flatMockDepartments } from '../../../components/_mock/department';

const multiValue = ref<string[]>(['d-1-1']);
const singleValue = ref<string[]>(['d-3-1']);

const multiDisplay = computed(() => multiValue.value.map((id) => flatMockDepartments.find((d) => d.id === id)?.name).join(', '));
const singleDisplay = computed(() => flatMockDepartments.find((d) => d.id === singleValue.value[0])?.name);

const onChange = (list: any[]) => console.log('multi change', list);
const onUseStrategy = async () => {
  const api = getDepartmentApiByMode('standard');
  const children = await api.loadChildren('d-1');
  const search = await api.search('研发');
  console.log('[standard] children:', children, 'search:', search);
};
const onUseStrategyCloud = async () => {
  const api = getDepartmentApiByMode('cloud');
  const children = await api.loadChildren('d-1');
  console.log('[cloud] children:', children);
};

defineOptions({ name: 'TeDepartmentDemo' });
</script>

<style lang="less" scoped>
.te-department-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .td-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .td-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .td-pre {
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
