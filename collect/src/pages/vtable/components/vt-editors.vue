<!--
 * 场景上下文：演示 @visactor/vtable-editors 提供的四种内置单元格编辑器，
 *   并接入 VTable 的编辑事件做可视化反馈。
 * 技术组合：Vue3 <script setup> + @visactor/vtable 1.26.x + @visactor/vtable-editors 1.26.x
 * 接入要点：
 *   1) import 编辑器后，用 VTable.register.editor(name, instance) 注册；
 *   2) 列配置里用 editor: 'name' 启用（双击单元格进入编辑，由 editCellTrigger 控制）；
 *   3) ListEditor 构造必须传 { values: [...] }，下拉项由此决定。
 -->
<template>
  <div class="vt-editors">
    <div ref="tableRef" class="vt-editors__table"></div>
    <div class="vt-editors__log">
      <span class="vt-editors__log-title">最近编辑：</span>
      <template v-if="logs.length">
        <span v-for="(log, i) in logs" :key="i" class="vt-editors__log-item">{{ log }}</span>
      </template>
      <span v-else class="vt-editors__log-empty">双击任意单元格进入编辑</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ListTable, register, themes } from '@visactor/vtable';
import {
  InputEditor,
  TextAreaEditor,
  DateInputEditor,
  ListEditor,
} from '@visactor/vtable-editors';
import { useThemeStore } from '@/store/modules/useThemeStore';

defineOptions({
  name: 'VtEditors',
});

const themeStore = useThemeStore();
const tableRef = ref<HTMLElement>();
const logs = ref<string[]>([]);
let table: ListTable | null = null;

const records = [
  { name: '林墨', bio: '语文教研，专注古诗文', birthday: '1990-03-12', gender: '女', city: '杭州' },
  { name: '苏野', bio: '数学竞赛教练', birthday: '1988-07-25', gender: '男', city: '北京' },
  { name: '陈舟', bio: '排课与教务', birthday: '1995-11-02', gender: '女', city: '上海' },
  { name: '何川', bio: '系统与数据', birthday: '1992-01-19', gender: '男', city: '深圳' },
];

let registered = false;
function ensureEditors() {
  if (registered) {
    return;
  }
  register.editor('vt-input', new InputEditor());
  register.editor('vt-textarea', new TextAreaEditor());
  register.editor('vt-date', new DateInputEditor());
  register.editor('vt-list-gender', new ListEditor({ values: ['女', '男'] }));
  register.editor('vt-list-city', new ListEditor({ values: ['北京', '上海', '广州', '深圳', '杭州', '成都'] }));
  registered = true;
}

function render() {
  ensureEditors();
  table?.release();
  table = new ListTable({
    container: tableRef.value as HTMLElement,
    records,
    widthMode: 'adaptive',
    theme: themeStore.isDark ? themes.DARK : themes.BRIGHT,
    editCellTrigger: 'doubleclick',
    columns: [
      { field: 'name', title: '姓名', width: 90, editor: 'vt-input' },
      { field: 'bio', title: '简介', width: 200, editor: 'vt-textarea' },
      { field: 'birthday', title: '生日', width: 120, editor: 'vt-date' },
      { field: 'gender', title: '性别', width: 80, editor: 'vt-list-gender' },
      { field: 'city', title: '城市', width: 100, editor: 'vt-list-city' },
    ],
  });

  table.on('change_cell_value', (args) => {
    const field = String(args.field ?? args.col);
    const msg = `行${args.row + 1} · ${field}：${String(args.rawValue ?? '空')} → ${String(args.changedValue ?? '空')}`;
    logs.value = [msg, ...logs.value].slice(0, 5);
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
.vt-editors {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .vt-editors__table {
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .vt-editors__log {
    flex: 0 0 auto;
    margin-top: 6px;
    padding: 6px 8px;
    font-size: 12px;
    line-height: 1.6;
    border-radius: var(--ai-radius-xs);
    background: var(--el-fill-color-light, rgba(255, 255, 255, 0.04));
    color: var(--el-text-color-secondary, #aaa);
    max-height: 96px;
    overflow: auto;

    .vt-editors__log-title {
      font-weight: 600;
    }

    .vt-editors__log-item {
      display: block;
    }

    .vt-editors__log-empty {
      opacity: 0.7;
    }
  }
}
</style>
