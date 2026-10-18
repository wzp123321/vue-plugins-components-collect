<script setup lang="ts">
// 校验问题抽屉：列出全部校验失败单元格，点击跳转定位
// 本组件读取 useGridCore.errorList 渲染问题清单，跳转动作交给 useGridOps.jumpToError。
// 协作：props.core(GridCore)→errorList(问题数组)；props.ops(GridOps)→errDrawer(显隐)/jumpToError(跳转)
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';

defineOptions({ name: 'ErrorDrawer' });
const props = defineProps<{ core: GridCore; ops: GridOps }>();

const { errorList } = props.core;
const { errDrawer, jumpToError } = props.ops;
</script>

<template>
  <el-drawer v-model="errDrawer" title="校验问题" direction="rtl" size="420px" class="dt-dlg">
    <!-- 空态：无错误时给出合规提示 -->
    <el-empty v-if="!errorList.length" description="没有校验错误，数据合规 ✅" />
    <div v-else class="err-list">
      <!-- 每条记录含 行标签·列标签 + 错误描述，点击整体跳转定位（含滚动到可见 + 活动格高亮） -->
      <div v-for="(e, i) in errorList" :key="i" class="err-item" @click="jumpToError(e)">
        <span class="err-idx">#{{ i + 1 }}</span>
        <div>
          <div class="err-field">{{ e.rowLabel }} · {{ e.colLabel }}</div>
          <div class="err-msg">{{ e.msg }}</div>
        </div>
        <el-button text size="small" type="primary">跳转</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.err-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.err-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ffd6d6;
  border-radius: 8px;
  background: #fff5f5;
  cursor: pointer;
  transition: all 0.15s;
}
.err-item:hover {
  border-color: var(--dt-danger);
  background: #ffece8;
}
.err-idx {
  font-weight: 700;
  color: var(--dt-danger);
}
.err-field {
  font-size: 13px;
  color: var(--dt-text);
  font-weight: 600;
}
.err-msg {
  font-size: 12px;
  color: #d4380d;
}
</style>
