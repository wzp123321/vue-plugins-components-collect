<template>
  <div class="te-space-select-demo">
    <header class="tss-demo-header">
      <h3>te-space-select — 空间级联选择</h3>
      <p>基于 cascader + 自定义 slot + useRemoteData hook，支持层级 disabled、远程懒加载模拟</p>
    </header>
    <div class="tss-demo-stage">
      <el-card>
        <template #header><span>多选（默认）</span></template>
        <te-space-select v-model="multi" :multiple="true" @change="onChange" />
        <pre class="tss-pre">已选: {{ displayMulti }}</pre>
      </el-card>

      <el-card>
        <template #header><span>单选（限制只能选到楼层）</span></template>
        <te-space-select v-model="single" :multiple="false" :allow-select-all-levels="limits" />
        <pre class="tss-pre">已选: {{ displaySingle }}</pre>
      </el-card>

      <el-card>
        <template #header><span>useRemoteData hook 用法演示</span></template>
        <el-button @click="onHook">调用 useRemoteData dealwithLazyData</el-button>
        <p class="tss-tip">查看控制台</p>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton } from 'element-plus';
import { TeSpaceSelect, useRemoteData } from '../../../components/te-space-select';
import { mockSpaceTree, flatMockSpaces } from '../../../components/_mock/space';

const multi = ref<string[]>(['s-1-1-1', 's-2-1-1']);
const single = ref<string[]>(['s-1-1']);

const limits = { building: false, floor: true, room: false };

const displayMulti = computed(() => multi.value.map((id) => flatMockSpaces().find((n) => n.id === id)?.name).join(', '));
const displaySingle = computed(() => flatMockSpaces().find((n) => n.id === single.value[0])?.name);

const onChange = (list: any[]) => console.log('change', list);
const onHook = () => {
  const { dealwithLazyData } = useRemoteData();
  const res = dealwithLazyData(mockSpaceTree, { building: true, floor: true, room: true });
  console.log('[hook] dealwithLazyData:', res);
};

defineOptions({ name: 'TeSpaceSelectDemo' });
</script>

<style lang="less" scoped>
.te-space-select-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tss-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tss-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tss-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
  .tss-tip { color: #909399; font-size: 12px; margin: 8px 0 0; }
}
</style>
