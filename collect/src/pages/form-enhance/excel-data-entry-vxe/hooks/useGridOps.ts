// 数据操作：行增删复制 / 自定义列增删移序 / 批量填充 / 提交 / 校验面板跳转
import { ref, reactive, computed, nextTick } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';
import type { CellSelection } from './useCellSelection';
import { type ColDef, type ColType, emptyValueFor } from '../types';

export function useGridOps(core: GridCore, tableRef: Ref<any>, scroll: GridScroll, sel: CellSelection) {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 框选选区（行选中移除后的批量作用域） =====================
  // 选区涉及的行（按当前查询结果序）；单元格数用于工具条禁用态与状态栏统计
  const selectionRows = computed(() => {
    const rect = sel.selRect.value;
    if (!rect) return [];
    return core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
  });
  const selectionCount = computed(() => {
    const rect = sel.selRect.value;
    return rect ? rect.rowIds.size * rect.fields.length : 0;
  });
  // 选区内数字格的聚合统计（Excel 选中数值区即显示计数/求和/平均）：仅统计数字列，无数值格时返回 null
  const selectionStats = computed(() => {
    const rect = sel.selRect.value;
    if (!rect) return null;
    const rows = core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
    let sum = 0,
      min = Infinity,
      max = -Infinity,
      cnt = 0;
    for (const r of rows) {
      for (const f of rect.fields) {
        const def = core.columnDefs.value.find((d) => d.field === f);
        if (def?.type !== 'number') continue;
        const v = r[f];
        if (v !== null && v !== '' && !isNaN(Number(v))) {
          const n = Number(v);
          sum += n;
          cnt++;
          if (n < min) min = n;
          if (n > max) max = n;
        }
      }
    }
    return cnt ? { count: cnt, sum: Number(sum.toFixed(2)), avg: Number((sum / cnt).toFixed(2)), min, max } : null;
  });

  // ===================== 行操作 =====================
  // 定位到指定行：scrollToRow 依赖 vxe 内部行高偏移（oTop），数据变更当轮该偏移尚未重算、拿到 0 会静默失败，
  // 且其自带的 350ms 兜底重滚在 show-overflow（isAllOverflow）下会被跳过——故在此短周期重试直至生效
  // （行已可见后再调是无害的空操作；若行被查询条件过滤掉，重试自然全部落空）
  const locateRow = (row: any) => {
    const locate = (tries = 0) => {
      tableRef.value?.scrollToRow?.(row);
      if (tries < 10) setTimeout(() => locate(tries + 1), 50);
    };
    nextTick(locate);
  };
  /** 定位到指定行并滚入可视区（新增/插入行后调用，见上方 locateRow 注释的重试原因） */
  const addRow = () => {
    snap();
    const row = core.makeRow();
    row.__dirty = true;
    core.validateRow(row);
    core.allRows.value.push(row);
    locateRow(row);
  };
  /** 在当前格下方插入一行；无当前格时退化为追加到末尾 */
  const insertRow = () => {
    snap();
    const row = core.makeRow();
    row.__dirty = true;
    core.validateRow(row);
    const idx = core.currentCell.value ? core.allRows.value.findIndex((r) => r.__id === core.currentCell.value!.row.__id) : -1;
    if (idx >= 0) core.allRows.value.splice(idx + 1, 0, row);
    else core.allRows.value.push(row);
  };
  /** 删除框选区域涉及的全部行（连带清除其错误标记） */
  const deleteSelected = () => {
    const rows = selectionRows.value;
    if (!rows.length) return;
    snap();
    const ids = new Set(rows.map((r: any) => r.__id));
    core.allRows.value = core.allRows.value.filter((r) => !ids.has(r.__id));
    for (const k of Object.keys(core.cellErrors)) if (ids.has(k.split('__')[0])) delete core.cellErrors[k];
    ElMessage.success(`已删除 ${rows.length} 行`);
  };
  /** 复制框选区域涉及的行，插在选区末行之后 */
  const duplicateSelected = () => {
    const rows = selectionRows.value;
    if (!rows.length) return;
    snap();
    const copies = rows.map((r: any) => {
      const c = core.makeRow({ ...r });
      c.__dirty = true;
      core.validateRow(c);
      return c;
    });
    const idx = core.allRows.value.findIndex((r) => r.__id === rows[rows.length - 1].__id);
    core.allRows.value.splice(idx + 1, 0, ...copies);
    ElMessage.success(`已复制 ${copies.length} 行`);
  };
  const clearAll = () => {
    snap();
    core.allRows.value = [];
    for (const k of Object.keys(core.cellErrors)) delete core.cellErrors[k];
  };

  // ===================== 列操作 =====================
  const colDialogVisible = ref(false);
  const colDrawer = ref(false);
  const colSeq = { n: 0 };
  const colForm = reactive({ name: '', type: 'text' as ColType, options: '', required: false });

  const openAddCol = () => {
    colForm.name = '';
    colForm.type = 'text';
    colForm.options = '';
    colForm.required = false;
    colDialogVisible.value = true;
  };
  const confirmAddCol = () => {
    const name = colForm.name.trim();
    if (!name) {
      ElMessage.warning('请输入列名');
      return;
    }
    snap();
    const field = `col_${++colSeq.n}_${Date.now()}`;
    const options = colForm.type === 'select' ? colForm.options.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : undefined;
    const def: ColDef = { field, label: name, type: colForm.type, options, required: colForm.required, visible: true };
    core.columnDefs.value.push(def);
    // 回填空值而非预选首选项：与 emptyValueFor / 新增行语义一致（预选会掩盖"未填写"）。
    // 必填列要立即逐行校验，否则新列的空值不会标红、必填标记形同虚设
    for (const r of core.allRows.value) {
      r[field] = emptyValueFor(def);
      if (def.required) core.validateCell(r, field);
    }
    colDialogVisible.value = false;
    ElMessage.success(`已新增列「${name}」`);
  };
  const removeCol = (field: string) => {
    snap();
    core.columnDefs.value = core.columnDefs.value.filter((c) => c.field !== field);
    for (const r of core.allRows.value) delete r[field];
    for (const k of Object.keys(core.cellErrors)) if (k.endsWith(`__${field}`)) delete core.cellErrors[k];
    delete core.columnFilters[field];
    ElMessage.success('已删除该列');
  };
  const moveCol = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= core.columnDefs.value.length) return;
    const arr = core.columnDefs.value;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    core.columnDefs.value = [...arr];
  };

  // ===================== 批量填充 =====================
  const fillVisible = ref(false);
  const fillField = ref('');
  const fillValue = ref('');
  const fillScope = ref<'selected' | 'result' | 'all'>('selected');
  const fillDef = computed(() => core.columnDefs.value.find((d) => d.field === fillField.value));

  const resolveFillTargets = (): any[] => {
    if (fillScope.value === 'selected') return selectionRows.value;
    if (fillScope.value === 'result') return core.processedRows.value;
    return core.allRows.value;
  };
  /** 批量填充：按范围（选区/当前结果/全部）写入指定列；数字列校验数值合法性，NaN 直接拒绝 */
  const batchFill = () => {
    const def = fillDef.value;
    if (!def) {
      ElMessage.warning('请选择列');
      return;
    }
    snap();
    const targets = resolveFillTargets();
    if (!targets.length) {
      ElMessage.warning('没有可填充的数据');
      return;
    }
    // 数字列同样要做合法性校验：输入框可键入任意文本，Number('abc')=NaN 会静默写入脏数据
    let v: any = fillValue.value;
    if (def.type === 'number') {
      if (fillValue.value === '') v = null;
      else {
        v = Number(fillValue.value);
        if (isNaN(v)) {
          ElMessage.warning('数字列只能填入数值');
          return;
        }
      }
    }
    for (const r of targets) {
      r[def.field] = v;
      r.__dirty = true;
      core.validateCell(r, def.field);
    }
    ElMessage.success(`已填充 ${targets.length} 行`);
  };
  const batchClearCol = () => {
    const def = fillDef.value;
    if (!def) return;
    snap();
    const targets = resolveFillTargets();
    for (const r of targets) {
      r[def.field] = emptyValueFor(def);
      r.__dirty = true;
      core.validateCell(r, def.field);
    }
    ElMessage.success('已清空该列');
  };

  // ===================== 校验面板 =====================
  const errDrawer = ref(false);
  /** 校验面板点击跳转：滚动定位 + 闪烁目标格（万行表里只滚不高亮会找不到人） */
  const jumpToError = (e: { rowId: string; field: string }) => {
    const row = core.allRows.value.find((r) => r.__id === e.rowId);
    if (!row) return;
    errDrawer.value = false;
    scroll.scrollToCell(row, e.field);
    // 跳转后闪烁目标格：此前只滚不高亮，万行表里跳过去找不到人（cellClassName 合并读取本 flashKeys）
    core.flashCell(e.rowId, e.field);
  };

  // ===================== 提交 =====================
  const submitting = ref(false);
  const submit = async () => {
    core.revalidateAll();
    if (core.errorCount.value > 0) {
      ElMessage.error(`有 ${core.errorCount.value} 处校验未通过，请先修正标红单元格`);
      errDrawer.value = true;
      return;
    }
    if (!core.allRows.value.length) {
      ElMessage.warning('没有可提交的数据');
      return;
    }
    submitting.value = true;
    try {
      const payload = core.allRows.value.map((r) => {
        const o: Record<string, any> = {};
        for (const d of core.columnDefs.value) o[d.field] = r[d.field];
        return o;
      });
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
      core.allRows.value.forEach((r) => (r.__dirty = false));
      ElMessage.success(`已提交 ${payload.length} 条记录（mock）`);
    } finally {
      submitting.value = false;
    }
  };

  return {
    // 框选选区（行操作/批量填充的作用域）
    selectionRows,
    selectionCount,
    selectionStats,
    // 行操作
    addRow,
    locateRow,
    insertRow,
    deleteSelected,
    duplicateSelected,
    clearAll,
    // 列操作
    colDialogVisible,
    colDrawer,
    colForm,
    openAddCol,
    confirmAddCol,
    removeCol,
    moveCol,
    // 批量填充
    fillVisible,
    fillField,
    fillValue,
    fillScope,
    fillDef,
    batchFill,
    batchClearCol,
    // 校验面板
    errDrawer,
    jumpToError,
    // 提交
    submitting,
    submit,
  };
}

export type GridOps = ReturnType<typeof useGridOps>;
