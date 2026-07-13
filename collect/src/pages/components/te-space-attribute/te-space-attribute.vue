<template>
  <div class="te-space-attribute-demo">
    <header class="tsa-demo-header">
      <h3>te-space-attribute — 空间功能属性（树+半选）</h3>
      <p>
        自定义 hook：getChildrenIds / getParentIds / getCheckedPIds / getUncheckedPIds / getIsChecked / getIsHalfChecked
      </p>
    </header>
    <div class="tsa-demo-stage">
      <el-card>
        <template #header><span>多选 + 联选（勾选所有子节点自动勾选父节点）</span></template>
        <te-space-attribute v-model="value1" />
        <pre class="tsa-pre">已选: {{ value1.join(', ') || '空' }}</pre>
      </el-card>

      <el-card>
        <template #header><span>查看半选状态（保留半选 id 不进 value，仅用于 UI 展示）</span></template>
        <te-space-attribute v-model="value2" />
        <p class="tsa-tip">半选节点: {{ halfIds.join(', ') || '无' }}</p>
        <pre class="tsa-pre">已选: {{ value2.join(', ') || '空' }}</pre>
      </el-card>

      <el-card>
        <template #header><span>useSpaceAttribute hook 单独演示</span></template>
        <el-button @click="onHook">调用 hook</el-button>
        <p class="tsa-tip">查看控制台</p>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton } from 'element-plus';
import { TeSpaceAttribute, useSpaceAttribute } from '../../../components/te-space-attribute';
import { flatSpaceAttrs } from '../../../components/_mock/space-attribute';
// import type { SpaceAttrTreeNode } from '../../../components/te-space-attribute';

const value1 = ref<string[]>(['sa-1-1-1']);
const value2 = ref<string[]>(['sa-1-1-1', 'sa-1-1-2']);

const halfIds = computed(() => {
  // const all = flatSpaceAttrs([]) as SpaceAttrTreeNode[];
  // 仅简单展示：哪些 node 当前是半选
  // 真正的半选计算需要 hook 树
  return [];
});

void halfIds; // 简化

const onHook = () => {
  const { getChildrenIds, getParentIds, getCheckedPIds, getUncheckedPIds, getIsChecked, getIsHalfChecked } =
    useSpaceAttribute({ modelValue: ['sa-1-1-1', 'sa-1-1-2'] });
  const all = flatSpaceAttrs([]) as any[];
  const sample = all.find((n) => n.id === 'sa-1-1');
  if (sample) {
    console.log('children of sa-1-1:', getChildrenIds(sample, []));
    console.log('parents of sa-1-1:', getParentIds(sample));
  }
  console.log('getCheckedPIds(sa-1-1, all selected):', getCheckedPIds(sample, ['sa-1-1-1', 'sa-1-1-2', 'sa-1-1-3']));
  console.log('getUncheckedPIds(sa-1-1, []):', sample ? getUncheckedPIds(sample, []) : []);
  console.log('getIsChecked(sa-1-1-1):', sample ? getIsChecked({ ...sample, id: 'sa-1-1-1' } as any) : false);
  console.log('getIsHalfChecked(sa-1-1):', sample ? getIsHalfChecked(sample) : false);
};

defineOptions({ name: 'TeSpaceAttributeDemo' });
</script>

<style lang="less" scoped>
.te-space-attribute-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .tsa-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;
    h3 {
      margin: 0 0 4px;
      font-size: 16px;
    }
    p {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }
  }

  .tsa-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tsa-pre {
    margin: 8px 0 0;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    white-space: pre-wrap;
  }
  .tsa-tip {
    color: #909399;
    font-size: 12px;
    margin: 8px 0;
  }
}
</style>
