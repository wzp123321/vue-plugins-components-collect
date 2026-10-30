<!--
 * 场景上下文：@visactor/vtable 是 VisActor 体系的高性能表格库（纯 Canvas 渲染，
 *   与框架无关，百万级数据流畅）。本站用它作为 AG Grid / vxe-table 的高性能对照，
 *   并借 @visactor/vtable-editors 扩展「单元格编辑」能力。
 * 技术组合：Vue3 <script setup> + @visactor/vtable 1.26.x + TypeScript + Element Plus
 * 踩坑落点：见 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div ref="tableRef" class="vt-basic"></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ListTable, themes } from '@visactor/vtable';
import { useThemeStore } from '@/store/modules/useThemeStore';

defineOptions({
  name: 'VtBasic',
});

const themeStore = useThemeStore();
const tableRef = ref<HTMLElement>();
let table: ListTable | null = null;

const records = [
  { id: 1, name: '林墨', dept: '教研一组', role: '语文教师', courses: 12 },
  { id: 2, name: '苏野', dept: '教研二组', role: '数学教师', courses: 9 },
  { id: 3, name: '陈舟', dept: '教务', role: '排课管理员', courses: 4 },
  { id: 4, name: '周岚', dept: '教研一组', role: '英语教师', courses: 15 },
  { id: 5, name: '何川', dept: '技术', role: '系统工程师', courses: 2 },
];

function render() {
  table?.release();
  table = new ListTable({
    container: tableRef.value as HTMLElement,
    records,
    widthMode: 'adaptive',
    theme: themeStore.isDark ? themes.DARK : themes.BRIGHT,
    columns: [
      { field: 'id', title: '编号', width: 70 },
      { field: 'name', title: '姓名', width: 100 },
      { field: 'dept', title: '部门', width: 120 },
      { field: 'role', title: '岗位', width: 140 },
      { field: 'courses', title: '负责课程数', width: 120 },
    ],
  });
}

onMounted(render);
watch(() => themeStore.isDark, render);
onBeforeUnmount(() => {
  table?.release();
  table = null;
});
</script>

<style lang="less" scoped>
.vt-basic {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
