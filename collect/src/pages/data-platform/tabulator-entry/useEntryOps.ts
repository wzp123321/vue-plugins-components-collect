// 数据操作层：行增删复制 / 列增删移序与列设置 / 批量填充 / 数据质量清理 / 模板 / 提交
// ============================================================================
// 本文件职责：
//   1. 行级操作：新增 / 上方插入 / 删除选中行 / 复制选中行 / 清空全部；
//   2. 列级操作：新增 / 删除 / 左右移序 / 显示隐藏 / 改列定义（名称、类型、必填、规则、选项、宽度）；
//   3. 批量填充（按选取范围或全部行写同一列）、数据质量清理（空行 / 完全重复行）；
//   4. 列结构模板的保存 / 加载 / 删除（localStorage，只存列结构不存数据）；
//   5. 提交：本地全量校验 → 模拟服务端校验 → 错误回填标红并跳转。
//
// 与 Univer 版的关系：业务逻辑逐字对齐；差异只在"读写通道"——Univer 是画布矩阵，Tabulator 是行对象，
// 故这里的 readRecords / writeRecords / selectionOrigin 直接吃 useEntrySheet 的 DOM 友好接口，不再处理 HEADER_ROW / 网格坐标。
// 每次结构性变更前调用 sheetApi.snapshot() 压一份数据副本，供 Ctrl+Z 撤销（Tabulator 自身无命令栈）。
// ============================================================================
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { makeEmptyRecord, newRowId, type ColDef, type ColType, type EntryRecord } from './schema';
import type { EntrySheet } from './useEntrySheet';
import type { CellError, EntryRules } from './useEntryRules';
import { rowIsEmpty as rowIsEmptyOf } from '@/utils/bi-entry';

/** 模板：只有列结构，没有数据（加载时再决定数据保留与否） */
export interface ColumnTemplate {
  name: string;
  defs: ColDef[];
  ts: number;
}

const TPL_KEY = 'tabulator_entry_templates';

/** 新增列的默认宽度 */
const NEW_COL_WIDTH = 120;

/**
 * 数据操作层。
 * @param sheetApi 网格读写通道
 * @param defs     列定义（页面级共享，增删列直接改它）
 * @param rules    校验引擎（提交前复检、错误标红）
 * @param rebuild  结构性变更后的重建回调（重写列定义 ⇄ Tabulator 列）
 */
export const useEntryOps = (
  sheetApi: EntrySheet,
  defs: { value: ColDef[] },
  rules: EntryRules,
  rebuild: () => void,
) => {
  const submitting = ref(false);
  const templates = ref<ColumnTemplate[]>([]);
  let colSeq = 0;

  // ===================== 行操作 =====================
  /** 追加一行空记录并校验（新行为空，必填列会立刻标红） */
  const addRow = () => {
    sheetApi.snapshot();
    const records = sheetApi.readRecords();
    records.push(makeEmptyRecord(defs.value));
    sheetApi.writeRecords(records);
    rules.validateAndMark(defs.value);
    ElMessage.success('已新增 1 行');
  };

  /** 在活动行上方插入一行；无活动格时退化为追加 */
  const insertRowAbove = () => {
    sheetApi.snapshot();
    const origin = sheetApi.selectionOrigin();
    const records = sheetApi.readRecords();
    // 选区可能是排序后的多行，取最小的数据下标作为插入点
    const at = origin ? Math.min(...origin.indices) : records.length;
    records.splice(Math.min(at, records.length), 0, makeEmptyRecord(defs.value));
    sheetApi.writeRecords(records);
    rules.validateAndMark(defs.value);
    ElMessage.success('已插入 1 行');
  };

  /** 删除选区覆盖的数据行（选区可能不连续：排序/筛选后按 rowId 折算出的下标来删） */
  const deleteSelectedRows = () => {
    const origin = sheetApi.selectionOrigin();
    if (!origin) {
      ElMessage.warning('请先选中要删除的行');
      return;
    }
    sheetApi.snapshot();
    const drop = new Set(origin.indices);
    const records = sheetApi.readRecords().filter((_r, i) => !drop.has(i));
    sheetApi.writeRecords(records);
    rules.validateAndMark(defs.value);
    ElMessage.success(`已删除 ${drop.size} 行`);
  };

  /** 复制选区覆盖的行，插到选区之后（副本必须换新 rowId，否则行身份撞车） */
  const duplicateSelectedRows = () => {
    const origin = sheetApi.selectionOrigin();
    if (!origin) {
      ElMessage.warning('请先选中要复制的行');
      return;
    }
    sheetApi.snapshot();
    const records = sheetApi.readRecords();
    const indices = origin.indices.slice().sort((a, b) => a - b);
    const copies = indices.map((i) => ({ ...records[i], rowId: newRowId() }));
    records.splice(indices[indices.length - 1] + 1, 0, ...copies);
    sheetApi.writeRecords(records);
    rules.validateAndMark(defs.value);
    ElMessage.success(`已复制 ${copies.length} 行`);
  };

  /** 清空全部数据（保留列结构与表头） */
  const clearAll = () => {
    ElMessageBox.confirm('将清空全部数据行（列结构与表头保留，可 Ctrl+Z 撤销），是否继续？', '清空数据', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        sheetApi.snapshot();
        sheetApi.writeRecords([]);
        rules.validateAndMark(defs.value);
        ElMessage.success('已清空全部数据');
      })
      .catch(() => {});
  };

  // ===================== 数据质量 =====================
  const rowIsEmpty = (rec: EntryRecord): boolean => rowIsEmptyOf(defs.value, rec);
  const emptyRowCount = (): number => sheetApi.readRecords().filter(rowIsEmpty).length;

  /** 一键删除空行（所有可见列都为空） */
  const removeEmptyRows = () => {
    const records = sheetApi.readRecords();
    const kept = records.filter((r) => !rowIsEmpty(r));
    const n = records.length - kept.length;
    if (!n) {
      ElMessage.info('没有发现空行');
      return;
    }
    sheetApi.snapshot();
    sheetApi.writeRecords(kept);
    rules.validateAndMark(defs.value);
    ElMessage.success(`已删除 ${n} 个空行`);
  };

  /** 一键去重：整行完全相同只保留首行 */
  const removeDuplicateRows = () => {
    const records = sheetApi.readRecords();
    const seen = new Set<string>();
    const kept: EntryRecord[] = [];
    let extra = 0;
    records.forEach((r) => {
      if (rowIsEmpty(r)) {
        kept.push(r);
        return;
      }
      const sig = defs.value.map((d) => String(r[d.field] ?? '')).join('\u0001');
      if (seen.has(sig)) extra++;
      else {
        seen.add(sig);
        kept.push(r);
      }
    });
    if (!extra) {
      ElMessage.info('没有发现完全重复的行');
      return;
    }
    ElMessageBox.confirm(`发现 ${extra} 行与前面完全相同，将删除（每组保留首行），是否继续？`, '去重', {
      confirmButtonText: '删除重复行',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        sheetApi.snapshot();
        sheetApi.writeRecords(kept);
        rules.validateAndMark(defs.value);
        ElMessage.success(`已删除 ${extra} 个重复行`);
      })
      .catch(() => {});
  };

  // ===================== 列操作 =====================
  /** 新增列：插到末尾，回填空值，立即重建列 */
  const addColumn = (input: { label: string; type: ColType; options?: string[]; required?: boolean }) => {
    const label = input.label.trim();
    if (!label) {
      ElMessage.warning('请输入列名');
      return;
    }
    sheetApi.snapshot();
    colSeq += 1;
    const field = `col_${colSeq}_${Date.now().toString(36)}`;
    defs.value = [
      ...defs.value,
      {
        field,
        label,
        type: input.type,
        options: input.type === 'select' ? input.options : undefined,
        required: input.required,
        width: NEW_COL_WIDTH,
        visible: true,
      },
    ];
    const records = sheetApi.readRecords();
    sheetApi.writeRecords(records);
    rebuild();
    rules.validateAndMark(defs.value);
    ElMessage.success(`已新增列「${label}」`);
  };

  /** 改列定义（名称/类型/必填/规则/选项/宽度/可见性） */
  const updateColumn = (field: string, patch: Partial<ColDef>) => {
    sheetApi.snapshot();
    defs.value = defs.value.map((d) => (d.field === field ? { ...d, ...patch } : d));
    const records = sheetApi.readRecords();
    sheetApi.writeRecords(records);
    rebuild();
    rules.validateAndMark(defs.value);
  };

  /** 删除列 */
  const removeColumn = (field: string) => {
    const idx = defs.value.findIndex((d) => d.field === field);
    if (idx < 0) return;
    sheetApi.snapshot();
    const records = sheetApi.readRecords().map((r) => {
      const next = { ...r };
      delete next[field];
      return next;
    });
    defs.value = defs.value.filter((d) => d.field !== field);
    sheetApi.deleteColumn(field);
    sheetApi.writeRecords(records);
    rebuild();
    ElMessage.success('已删除该列');
  };

  /** 左右移序：列定义换位后整表重写 */
  const moveColumn = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= defs.value.length) return;
    sheetApi.snapshot();
    const next = defs.value.slice();
    [next[index], next[target]] = [next[target], next[index]];
    defs.value = next;
    const records = sheetApi.readRecords();
    sheetApi.writeRecords(records);
    rebuild();
  };

  /** 显示 / 隐藏列（隐藏列保留数据） */
  const toggleColumnVisible = (field: string) => {
    const def = defs.value.find((d) => d.field === field);
    if (!def) return;
    updateColumn(field, { visible: !def.visible });
  };

  // ===================== 批量填充 =====================
  /**
   * 批量填充指定列：范围可为选区或全部数据行。
   * 数字列做数值合法性校验（拒绝 NaN），其余按字符串写入。
   */
  const batchFill = (field: string, rawValue: string, scope: 'selection' | 'all') => {
    const def = defs.value.find((d) => d.field === field);
    if (!def) return;
    let value: unknown = rawValue;
    if (def.type === 'number') {
      if (rawValue === '') value = null;
      else {
        const n = Number(rawValue);
        if (Number.isNaN(n)) {
          ElMessage.warning('数字列只能填入数值');
          return;
        }
        value = n;
      }
    }
    const total = sheetApi.dataRowCount();
    if (total <= 0) {
      ElMessage.warning('没有可填充的数据');
      return;
    }
    let targets: number[] | null = null;
    if (scope === 'selection') {
      const origin = sheetApi.selectionOrigin();
      if (!origin) {
        ElMessage.warning('请先选中要填充的行');
        return;
      }
      // 选区可能是排序/筛选后的不连续行，按折算出的数据下标逐行写
      targets = origin.indices;
    }
    sheetApi.snapshot();
    const records = sheetApi.readRecords();
    if (targets) {
      targets.forEach((i) => {
        records[i] = { ...records[i], [field]: value };
      });
    } else {
      for (let i = 0; i < total; i += 1) {
        records[i] = { ...records[i], [field]: value };
      }
    }
    sheetApi.writeRecords(records);
    rules.validateAndMark(defs.value);
    ElMessage.success(`已填充 ${targets ? targets.length : total} 行`);
  };

  /** 批量清空指定列（按范围） */
  const batchClear = (field: string, scope: 'selection' | 'all') => {
    batchFill(field, '', scope);
  };

  // ===================== 模板（localStorage） =====================
  const loadTemplates = () => {
    try {
      templates.value = JSON.parse(localStorage.getItem(TPL_KEY) || '[]') as ColumnTemplate[];
    } catch {
      templates.value = [];
    }
  };

  const saveTemplate = () => {
    ElMessageBox.prompt('模板只保存列结构（列名/类型/必填/规则），不保存数据', '保存列模板', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPlaceholder: '模板名称',
    })
      .then(({ value }) => {
        const name = value.trim();
        if (!name) {
          ElMessage.warning('请输入模板名称');
          return;
        }
        templates.value = templates.value.filter((t) => t.name !== name);
        templates.value.push({ name, defs: JSON.parse(JSON.stringify(defs.value)) as ColDef[], ts: Date.now() });
        localStorage.setItem(TPL_KEY, JSON.stringify(templates.value));
        ElMessage.success(`已保存模板「${name}」`);
      })
      .catch(() => {});
  };

  const applyTemplate = (t: ColumnTemplate, keepData: boolean) => {
    sheetApi.snapshot();
    const nextDefs = JSON.parse(JSON.stringify(t.defs)) as ColDef[];
    const fields = new Set(nextDefs.map((d) => d.field));
    let records: EntryRecord[] = [];
    if (keepData) {
      records = sheetApi.readRecords().map((r) => {
        const next: EntryRecord = {};
        nextDefs.forEach((d) => {
          next[d.field] = fields.has(d.field) && d.field in r ? r[d.field] : '';
        });
        return next;
      });
    }
    defs.value = nextDefs;
    sheetApi.writeRecords(records);
    rebuild();
    rules.validateAndMark(nextDefs);
    ElMessage.success(`已加载模板「${t.name}」`);
  };

  /** 加载模板：整体替换列结构，数据可选择保留（按新字段裁剪/补齐）或清空 */
  const loadTemplate = (name: string) => {
    const t = templates.value.find((x) => x.name === name);
    if (!t) return;
    ElMessageBox.confirm(`加载模板「${name}」会替换当前列结构，现有数据是否保留？`, '加载模板', {
      confirmButtonText: '保留数据',
      cancelButtonText: '清空数据',
      distinguishCancelAndClose: true,
      type: 'warning',
    })
      .then(() => applyTemplate(t, true))
      .catch((action: string) => {
        if (action === 'cancel') applyTemplate(t, false);
      });
  };

  const deleteTemplate = (name: string) => {
    templates.value = templates.value.filter((t) => t.name !== name);
    localStorage.setItem(TPL_KEY, JSON.stringify(templates.value));
    ElMessage.success('已删除模板');
  };

  // ===================== 提交 =====================
  /** 模拟服务端校验：真实项目替换成接口调用即可 */
  const serverValidate = async (payload: EntryRecord[]): Promise<CellError[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });
    const out: CellError[] = [];
    payload.forEach((rec, dataIndex) => {
      const push = (field: string, msg: string) => {
        const colIndex = defs.value.findIndex((d) => d.field === field);
        out.push({
          dataIndex,
          sheetRow: dataIndex + 1,
          field,
          colIndex,
          label: defs.value[colIndex]?.label ?? field,
          rowLabel: String(rec[defs.value[0]?.field] ?? ''),
          msg,
        });
      };
      if (Number(rec.age) > 62 && !String(rec.remark ?? '').trim()) push('remark', '服务端：年龄超 62 岁须在备注中说明');
      if (/^test|测试/i.test(String(rec.name ?? '').trim())) push('name', '服务端：姓名疑似测试数据，请修正');
    });
    return out;
  };

  const submit = async (): Promise<boolean> => {
    const records = sheetApi.readRecords();
    const kept = records.filter((r) => !rowIsEmpty(r));
    if (kept.length !== records.length) {
      sheetApi.snapshot();
      sheetApi.writeRecords(kept);
      ElMessage.info(`已忽略 ${records.length - kept.length} 个空行`);
    }
    if (!kept.length) {
      ElMessage.warning('没有可提交的数据');
      return false;
    }
    const local = rules.validateAndMark(defs.value);
    if (local.length) {
      ElMessage.error(`有 ${local.length} 处校验未通过，请先修正标红单元格`);
      return false;
    }
    submitting.value = true;
    try {
      const serverErrs = await serverValidate(kept);
      if (serverErrs.length) {
        rules.markErrors(serverErrs);
        rules.errors.value = serverErrs;
        const first = serverErrs[0];
        if (first) rules.jumpTo(first);
        ElMessage.error(`服务端校验未通过 ${serverErrs.length} 处，已在表格标红`);
        return false;
      }
      ElMessage.success(`已提交 ${kept.length} 条记录（mock）`);
      return true;
    } finally {
      submitting.value = false;
    }
  };

  return {
    submitting,
    templates,
    addRow,
    insertRowAbove,
    deleteSelectedRows,
    duplicateSelectedRows,
    clearAll,
    emptyRowCount,
    removeEmptyRows,
    removeDuplicateRows,
    addColumn,
    updateColumn,
    removeColumn,
    moveColumn,
    toggleColumnVisible,
    batchFill,
    batchClear,
    loadTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    submit,
  };
};

export type EntryOps = ReturnType<typeof useEntryOps>;
