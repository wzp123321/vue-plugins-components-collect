<script setup lang="ts">
// 列设置抽屉（vxe 版 · 引擎薄壳）
// ---------------------------------------------------------------------------
// 视觉与交互全交给三套共用的 components/bi-column-manager，
// 这里只留 vxe 特有的副作用：
//   · 开关类改动必须先压快照（撤销栈）再赋值，否则勾了"必填"撤销不回去；
//   · 改完要全量重校验，否则表格不标红、错误数不变；
//   · 隐藏列时顺手清掉它的筛选/排序，避免数据被"看不见的条件"过滤后误判成丢了。
// 能力开关：vxe 不支持在列表里改类型（改类型要连带转数据），走「配置」抽屉；新增列在工具栏。
import { computed } from 'vue';
import type { GridCore } from '../hooks/useGridCore';
import type { GridOps } from '../hooks/useGridOps';
import BiColumnManager from '@/components/bi-column-manager/bi-column-manager.vue';

defineOptions({ name: 'ColumnManagerDrawer' });
const props = defineProps<{ core: GridCore; ops: GridOps }>();
const emit = defineEmits<{ (e: 'config', field: string): void }>();

const { columnDefs } = props.core;
const { colDrawer, moveCol, removeCol } = props.ops;

const visibleModel = computed({
  get: () => colDrawer.value,
  set: (v: boolean) => { colDrawer.value = v; },
});

/** 先快照旧值 → 再赋值：保证这一步改动可撤销 */
const withSnapshot = (apply: () => void) => {
  props.core.pushSnapshot(props.core.snapshotNow());
  apply();
};

const onRename = (field: string, label: string) => {
  const def = columnDefs.value.find((d) => d.field === field);
  if (def) {
    def.label = label;
  }
};

const onToggle = (field: string, flag: 'required' | 'visible' | 'frozen') => {
  const def = columnDefs.value.find((d) => d.field === field);
  if (!def) {
    return;
  }
  if (flag === 'frozen') {
    withSnapshot(() => { def.frozen = !def.frozen; });
    return;
  }
  if (flag === 'required') {
    withSnapshot(() => { def.required = !def.required; });
    props.core.revalidateAll();
    return;
  }
  const nextVisible = def.visible === false;
  withSnapshot(() => { def.visible = nextVisible; });
  if (!nextVisible) {
    props.core.removeColumnFilter(field);
    props.core.removeFieldSort(field);
  }
  props.core.revalidateAll();
};
</script>

<template>
  <BiColumnManager
    v-model:visible="visibleModel"
    :cols="columnDefs"
    :caps="{ frozen: true, retype: false, add: false }"
    @rename="onRename"
    @toggle="onToggle"
    @move="(i: number, dir: -1 | 1) => moveCol(i, dir)"
    @config="(field: string) => emit('config', field)"
    @remove="(field: string) => removeCol(field)"
  />
</template>
