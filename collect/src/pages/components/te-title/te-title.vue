<template>
  <div class="te-title-demo">
    <header class="tt-demo-header">
      <h3>te-title — 职务选择器</h3>
      <p>支持多选/单选、搜索、级联、已选 chip 智能 tooltip</p>
    </header>
    <div class="tt-demo-stage">
      <el-card>
        <template #header><span>多选模式</span></template>
        <te-title v-model="multiValue" :multiple="true" @change="onMultiChange" />
        <pre class="tt-pre">已选 ID: {{ multiValue }}\n已选: {{ multiNames }}</pre>
      </el-card>

      <el-card>
        <template #header><span>单选模式</span></template>
        <te-title v-model="singleValue" :multiple="false" @change="onSingleChange" />
        <pre class="tt-pre">已选: {{ singleName }}</pre>
      </el-card>

      <el-card>
        <template #header><span>长名称测试（智能 tooltip）</span></template>
        <div class="tt-row">
          <te-title v-model="longValue" :multiple="true" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard } from 'element-plus';
import { TeTitle } from '../../../components/te-title';
import { mockTitles } from '../../../components/_mock/title';

const multiValue = ref<string[]>(['t-1', 't-4']);
const singleValue = ref<string[]>(['t-2']);
const longValue = ref<string[]>(['t-1', 't-4', 't-2', 't-5']);

const multiNames = computed(() => multiValue.value.map((id) => mockTitles.find((t) => t.id === id)?.name).join(', '));
const singleName = computed(() => mockTitles.find((t) => t.id === singleValue.value[0])?.name);

const onMultiChange = (list: any[]) => console.log('multi change', list);
const onSingleChange = (list: any[]) => console.log('single change', list);

defineOptions({ name: 'TeTitleDemo' });
</script>

<style lang="less" scoped>
.te-title-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tt-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tt-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tt-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }

  .tt-row { max-width: 320px; }
}
</style>
