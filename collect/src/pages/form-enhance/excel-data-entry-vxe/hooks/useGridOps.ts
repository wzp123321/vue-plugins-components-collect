// 数据操作：新增行 / 新增列（删列）/ 提交保存（全量复校验 → 红框 + 跳首个错误 + 打印 mock）
// 与 Univer 录入台对齐：行只支持「追加」，列支持「新增 / 删除」，保存走「全量复校验 → 标红 + 跳首个错误」。
import { ref, reactive, computed, nextTick } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';
import type { CellSelection } from './useCellSelection';
import { type ColDef, type ColType } from '../types';
import { aggregateCells } from './aggregate';
import { emptyValueFor } from '@/utils/bi-entry';

/**
 * 行主键 / 脏标记访问助手。
 * ⚠️ __id / __dirty 是 vxe-table 消费的行字段（__id 即页面 :row-config 的 keyField），
 * 属性名属外部约定、不可重命名；经解构读取、Object.assign 写入，键名与语义不变，
 * 同时避免 no-underscore-dangle 报错。
 */
const rowIdOf = (r?: { __id: string } | null): string => {
  if (!r) return '';
  const { __id } = r;
  return __id ?? '';
};
const markDirty = (r: { __dirty: boolean }): void => {
  Object.assign(r, { __dirty: true });
};
const clearDirty = (r: { __dirty: boolean }): void => {
  Object.assign(r, { __dirty: false });
};

/**
 * 数据操作层：新增行 / 新增列 / 删除列 / 提交保存。
 *
 * 在整体架构中的角色：所有"批量作用域"收敛到 useCellSelection 的框选矩形
 * （selectionCount / selectionStats），本层是框选区域的消费方。写数据前统一
 * `snap()` 入撤销栈，并负责把"列结构变更 / 数据变动"后的全量重校（revalidateAll）串起来。
 *
 * 与 useGridScroll（跳转）协作。提交语义对齐 Univer：全量复校验 → 有错误则红框 + 跳首个错误 +
 * 提示，无错误则清脏标记并打印 mock（真实项目替换成接口调用）。
 *
 * @param core  核心状态实例
 * @param tableRef vxe 实例（scrollToRow 定位）
 * @param scroll 滚动定位实例（scrollToCell 供校验跳转）
 * @param sel   自研选区状态机（框选用作域来源）
 */
export const useGridOps = (
  core: GridCore,
  tableRef: Ref<any>,
  scroll: GridScroll,
  sel: CellSelection,
) => {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 框选选区统计 =====================
  /** 选区单元格总数（行跨度 × 列跨度）：工具条批量按钮禁用态判据 */
  const selectionCount = computed(() => {
    const rect = sel.selRect.value;
    return rect ? (rect.bottomIdx - rect.topIdx + 1) * (rect.rightIdx - rect.leftIdx + 1) : 0;
  });
  // 状态栏统计：选区内数字格聚合（count/sum/avg/min/max）。仅统计数字列，无数值格时返回 null。
  const selectionStats = computed(() => {
    const rect = sel.selRect.value;
    if (!rect) return null;
    const numFields = new Set(core.columnDefs.value.filter((d) => d.type === 'number').map((d) => d.field));
    const fields = sel.rectFields(rect).filter((f) => numFields.has(f));
    if (!fields.length) return null;
    return aggregateCells(sel.rectRows(rect), fields);
  });

  // ===================== 新增行 =====================
  // ⚠️ 坑：定位到指定行——scrollToRow 依赖 vxe 内部行高偏移（oTop），数据变更当轮该偏移尚未重算、拿到 0 会静默失败，
  // 且其自带的 350ms 兜底重滚在 show-overflow（isAllOverflow）下会被跳过——故在此短周期重试直至生效
  // （行已可见后再调是无害的空操作；若行被查询条件过滤掉，重试自然全部落空）
  const locateRow = (row: any) => {
    const locate = (tries = 0) => {
      tableRef.value?.scrollToRow?.(row);
      if (tries < 10) setTimeout(() => locate(tries + 1), 50);
    };
    nextTick(locate);
  };
  /** 追加一行并滚入可视区；返回新行（键盘层 Tab 到末行末尾时用它续录） */
  const addRow = () => {
    snap();
    const row = core.makeRow();
    markDirty(row);
    core.validateRow(row);
    core.allRows.value.push(row);
    core.bumpData();
    locateRow(row);
    return row;
  };

  // ===================== 新增列 =====================
  const colDialogVisible = ref(false);
  const colSeq = { n: 0 };
  const colForm = reactive({ name: '', type: 'text' as ColType, options: '', required: false });

  const openAddCol = () => {
    colForm.name = '';
    colForm.type = 'text';
    colForm.options = '';
    colForm.required = false;
    colDialogVisible.value = true;
  };
  /**
   * 确认新增列：用 colForm 生成 ColDef 并 push 进 columnDefs；回填空值（不预选首项，避免掩盖"未填写"），
   * 必填列立即逐行校验（否则新列空值不标红、必填形同虚设）。列重建后 columns 的 watch 会自动 applyColumns。
   */
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
    core.allRows.value.forEach((r) => {
      r[field] = emptyValueFor(def);
      if (def.required) core.validateCell(r, field);
    });
    colDialogVisible.value = false;
    core.bumpData();
    ElMessage.success(`已新增列「${name}」`);
  };

  /**
   * 删除一列：从 columnDefs 移除定义、从所有行删除该字段、清除相关错误标记与筛选状态。
   * @param field 要删除的字段
   */
  const removeCol = (field: string) => {
    snap();
    core.columnDefs.value = core.columnDefs.value.filter((c) => c.field !== field);
    core.allRows.value.forEach((r) => {
      delete r[field];
    });
    Object.keys(core.cellErrors).forEach((k) => {
      if (k.endsWith(`__${field}`)) delete core.cellErrors[k];
    });
    delete core.columnFilters[field];
    core.bumpData();
    ElMessage.success('已删除该列');
  };

  // ===================== 提交保存（对齐 Univer：全量复校验 → 红框 + 跳首个错误 + 打印 mock） =====================
  const submitting = ref(false);
  /**
   * 保存：全量复校验，有错误则红框 + 跳到首个错误单元格并闪烁、提示；无错误则清脏标记并打印 mock 数据。
   * 与 Univer 的 onSave 语义一致——真实项目把打印 mock 换成接口调用即可。
   */
  const submit = async () => {
    if (!core.allRows.value.length) {
      ElMessage.warning('没有可提交的数据');
      return;
    }
    core.revalidateAll();
    if (core.errorCount.value > 0) {
      // 红框已由 cellErrors 驱动；跳到首个错误单元格并闪烁，便于在万行表中定位
      const firstKey = Object.keys(core.cellErrors)[0];
      if (firstKey) {
        const [rowId, field] = firstKey.split('__');
        const row = core.allRows.value.find((r) => rowIdOf(r) === rowId);
        if (row) {
          scroll.scrollToCell(row, field);
          core.flashCell(rowId, field);
        }
      }
      ElMessage.error(`有 ${core.errorCount.value} 处校验未通过，已标红，请修正后再保存`);
      return;
    }
    submitting.value = true;
    try {
      // 真实项目替换成接口调用；此处打印 mock 数据（结构对齐 Univer 的「打印 mock」）
      console.log('[mock] 提交数据', core.allRows.value.map((r) => {
        const o: Record<string, any> = {};
        core.columnDefs.value.forEach((d) => {
          o[d.field] = r[d.field];
        });
        return o;
      }));
      // 通过：清脏标记
      core.allRows.value.forEach((r) => {
        clearDirty(r);
      });
      ElMessage.success(`已提交 ${core.allRows.value.length} 条记录（mock）`);
    } finally {
      submitting.value = false;
    }
  };

  return {
    // 框选选区统计（头部 pill 与状态栏共用）
    selectionCount,
    selectionStats,
    // 新增行
    addRow,
    locateRow,
    // 新增列 / 删除列
    colDialogVisible,
    colForm,
    openAddCol,
    confirmAddCol,
    removeCol,
    // 提交保存
    submitting,
    submit,
  };
};

/**
 * useGridOps 的返回类型别名：导出 selectionCount / selectionStats / addRow / locateRow /
 * openAddCol / confirmAddCol / removeCol / submitting / submit，供工具栏与右键菜单调用。
 */
export type GridOps = ReturnType<typeof useGridOps>;
