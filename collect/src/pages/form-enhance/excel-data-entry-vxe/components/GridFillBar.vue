<script setup lang="ts">
// 批量填充面板：对框选区域涉及行 / 当前结果 / 全部行填充或清空指定列
// 本组件仅提供"列/值/范围"选择与提交按钮，实际写入逻辑在 useGridOps.batchFill / batchClearCol。
// 协作：props.core(GridCore)→visibleDefs(可填充的列)；props.ops(GridOps)→fillVisible/字段状态/batchFill/batchClearCol
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';

defineOptions({ name: 'GridFillBar' });
const props = defineProps<{ core: GridCore; ops: GridOps }>();

const { visibleDefs } = props.core;
// fillField(目标列) / fillValue(要填的值) / fillScope(范围) / fillDef(当前选中列的 ColDef，用于决定值控件类型)
const { fillVisible, fillField, fillValue, fillScope, fillDef, batchFill, batchClearCol } = props.ops;
</script>

<template>
  <div v-if="fillVisible" class="dt-fillbar">
    <span>列</span>
    <el-select v-model="fillField" style="width: 130px">
      <el-option v-for="d in visibleDefs" :key="d.field" :label="d.label" :value="d.field" />
    </el-select>
    <span>值</span>
    <!-- select 列用下拉选值，其它类型用文本框（number 列仍走文本框，由写入逻辑做类型转换/校验） -->
    <el-input v-if="fillDef?.type !== 'select'" v-model="fillValue" style="width: 150px"
      :placeholder="fillDef?.type === 'number' ? '数字' : '文本'" />
    <el-select v-else v-model="fillValue" style="width: 150px" placeholder="选择">
      <el-option v-for="o in fillDef.options" :key="o" :label="o" :value="o" />
    </el-select>
    <span>范围</span>
    <el-select v-model="fillScope" style="width: 130px">
      <el-option label="框选区域" value="selected" />
      <el-option label="当前结果" value="result" />
      <el-option label="全部" value="all" />
    </el-select>
    <el-button size="small" type="primary" @click="batchFill">应用</el-button>
    <el-button size="small" @click="batchClearCol">清空该列</el-button>
    <el-button size="small" text @click="fillVisible = false">✕</el-button>
  </div>
</template>

<style scoped>
.dt-fillbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--dt-panel);
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--dt-sub);
}
</style>
