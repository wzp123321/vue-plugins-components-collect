// 数据操作：行增删复制 / 自定义列增删移序 / 批量填充 / 数据质量清理 / 提交 / 校验面板跳转
import { ref, reactive, computed, nextTick } from 'vue';
import type { Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';
import type { CellSelection } from './useCellSelection';
import type { GridDraft } from './useGridDraft';
import { type ColDef, type ColType, emptyValueFor } from '../types';
import { aggregateCells } from './aggregate';

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
 * 数据操作层：行增删复制 / 自定义列增删移序 / 批量填充 / 数据质量清理 / 提交 / 校验面板跳转。
 *
 * 在整体架构中的角色：行选中（复选框）移除后，所有"批量作用域"都收敛到 useCellSelection 的框选矩形，
 * 本层是框选区域的消费方（selectionRows / selectionCount / selectionStats）。它写数据前统一
 * `snap()` 入撤销栈，并负责把"列结构变更 / 数据变动"后的全量重校（revalidateAll）串起来。
 * 与 useGridScroll（跳转）、useGridDraft（提交后清草稿）协作。
 *
 * @param core  核心状态实例
 * @param tableRef vxe 实例（scrollToRow 定位）
 * @param scroll 滚动定位实例（scrollToCell 供校验面板/查找跳转）
 * @param sel   自研选区状态机（批量操作的作用域来源）
 * @param draft 草稿实例（提交成功后清草稿；可选）
 */
export const useGridOps = (
  core: GridCore,
  tableRef: Ref<any>,
  scroll: GridScroll,
  sel: CellSelection,
  draft?: GridDraft,
) => {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 框选选区（行选中移除后的批量作用域） =====================
  /** 选区涉及的行（按当前查询结果序）：批量操作（删/复制/填充）的作用域；单元格数用于工具条禁用态 */
  const selectionRows = computed(() => sel.rectRows(sel.selRect.value));
  /** 选区单元格总数（行跨度 × 列跨度）：工具条批量按钮禁用态判据 */
  const selectionCount = computed(() => {
    const rect = sel.selRect.value;
    return rect ? (rect.bottomIdx - rect.topIdx + 1) * (rect.rightIdx - rect.leftIdx + 1) : 0;
  });
  // ⚠️ 坑：状态栏统计双轨——本 selectionStats 是"选区内数字格聚合"（count/sum/avg/min/max），
  // 与 useGridCore 的 activeStats（当前列全量统计）相互独立、分别呈现。仅统计数字列，无数值格时返回 null。
  const selectionStats = computed(() => {
    const rect = sel.selRect.value;
    if (!rect) return null;
    // 数值列集合先算一次，避免逐格 columnDefs.find；非数值列直接不参与
    const numFields = new Set(core.columnDefs.value.filter((d) => d.type === 'number').map((d) => d.field));
    const fields = sel.rectFields(rect).filter((f) => numFields.has(f));
    if (!fields.length) return null;
    return aggregateCells(sel.rectRows(rect), fields);
  });

  // ===================== 行操作 =====================
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
  /** 在当前格下方插入一行；无当前格时退化为追加到末尾 */
  const insertRow = () => {
    snap();
    const row = core.makeRow();
    markDirty(row);
    core.validateRow(row);
    const idx = core.currentCell.value ? core.allRows.value.findIndex((r) => rowIdOf(r) === rowIdOf(core.currentCell.value!.row)) : -1;
    if (idx >= 0) core.allRows.value.splice(idx + 1, 0, row);
    else core.allRows.value.push(row);
    core.bumpData();
  };
  /** 删除框选区域涉及的全部行（连带清除其错误标记） */
  const deleteSelected = () => {
    const rows = selectionRows.value;
    if (!rows.length) return;
    snap();
    const ids = new Set(rows.map((r: any) => rowIdOf(r)));
    core.allRows.value = core.allRows.value.filter((r) => !ids.has(rowIdOf(r)));
    Object.keys(core.cellErrors).forEach((k) => {
      if (ids.has(k.split('__')[0])) delete core.cellErrors[k];
    });
    core.bumpData();
    ElMessage.success(`已删除 ${rows.length} 行`);
  };
  /** 复制框选区域涉及的行，插在选区末行之后 */
  const duplicateSelected = () => {
    const rows = selectionRows.value;
    if (!rows.length) return;
    snap();
    const copies = rows.map((r: any) => {
      const c = core.makeRow({ ...r });
      markDirty(c);
      core.validateRow(c);
      return c;
    });
    const idx = core.allRows.value.findIndex((r) => rowIdOf(r) === rowIdOf(rows[rows.length - 1]));
    core.allRows.value.splice(idx + 1, 0, ...copies);
    core.bumpData();
    ElMessage.success(`已复制 ${copies.length} 行`);
  };
  /** 清空所有行数据（可撤销），并连带清除全部错误标记 */
  const clearAll = () => {
    snap();
    core.allRows.value = [];
    Object.keys(core.cellErrors).forEach((k) => {
      delete core.cellErrors[k];
    });
    core.bumpData();
  };

  // ===================== 数据质量：空行 / 重复行 =====================
  // 只按"可见列全为空"判定空行：隐藏列里残留的值不阻止清理（用户视角就是空行）
  const rowIsEmpty = (r: any) => core.visibleDefs.value.every((d) => r[d.field] === null || r[d.field] === undefined || r[d.field] === '');
  const emptyRowCount = () => core.allRows.value.filter(rowIsEmpty).length;
  // 整行签名：按可见列拼全值，用于找出"每一列都完全相同"的重复行
  const dupSignature = (r: any) => core.visibleDefs.value.map((d) => String(r[d.field] ?? '')).join('\u0001');
  const dupGroups = (): string[][] => {
    const m = new Map<string, string[]>();
    core.allRows.value.forEach((r) => {
      // 空行不计入重复，交给空行清理处理（原 continue 的反条件写法）
      if (!rowIsEmpty(r)) {
        const k = dupSignature(r);
        const g = m.get(k);
        if (g) g.push(rowIdOf(r));
        else m.set(k, [rowIdOf(r)]);
      }
    });
    return [...m.values()].filter((g) => g.length > 1);
  };

  /** 一键删除空行（可撤销） */
  const removeEmptyRows = () => {
    const n = emptyRowCount();
    if (!n) {
      ElMessage.info('没有发现空行');
      return;
    }
    snap();
    core.allRows.value = core.allRows.value.filter((r) => !rowIsEmpty(r));
    core.revalidateAll();
    core.bumpData();
    ElMessage.success(`已删除 ${n} 个空行`);
  };

  /** 一键去重：每组完全相同的行只保留首行（可撤销） */
  const removeDuplicateRows = () => {
    const groups = dupGroups();
    const extra = groups.reduce((n, g) => n + g.length - 1, 0);
    if (!extra) {
      ElMessage.info('没有发现完全重复的行');
      return;
    }
    ElMessageBox.confirm(`发现 ${groups.length} 组重复行，将删除其中 ${extra} 行（每组保留首行），是否继续？`, '去重', {
      confirmButtonText: '删除重复行',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        snap();
        const drop = new Set<string>();
        groups.forEach((g) => {
          for (let i = 1; i < g.length; i++) drop.add(g[i]);
        });
        core.allRows.value = core.allRows.value.filter((r) => !drop.has(rowIdOf(r)));
        core.revalidateAll();
        core.bumpData();
        ElMessage.success(`已删除 ${drop.size} 个重复行`);
      })
      .catch(() => {});
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
  /**
   * 移动列顺序（左/右）：交换 columnDefs 中相邻两列后整体重赋（触发 columns 重建），实现列重排。
   * @param i   当前列索引
   * @param dir -1 左移 / +1 右移
   */
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
        if (Number.isNaN(v)) {
          ElMessage.warning('数字列只能填入数值');
          return;
        }
      }
    }
    core.commitCells('批量填充', targets, () => {
      targets.forEach((r) => {
        r[def.field] = v;
        markDirty(r);
        core.validateCell(r, def.field);
      });
    });
    ElMessage.success(`已填充 ${targets.length} 行`);
  };
  /** 批量清空指定列：按当前范围（选区/结果/全部）把该列重置为列类型的空值并标脏、校验 */
  const batchClearCol = () => {
    const def = fillDef.value;
    if (!def) return;
    const targets = resolveFillTargets();
    core.commitCells('批量清空列', targets, () => {
      targets.forEach((r) => {
        r[def.field] = emptyValueFor(def);
        markDirty(r);
        core.validateCell(r, def.field);
      });
    });
    ElMessage.success('已清空该列');
  };

  // ===================== 校验面板 =====================
  const errDrawer = ref(false);
  /** 校验面板点击跳转：滚动定位 + 闪烁目标格（万行表里只滚不高亮会找不到人） */
  const jumpToError = (e: { rowId: string; field: string }) => {
    const row = core.allRows.value.find((r) => rowIdOf(r) === e.rowId);
    if (!row) return;
    errDrawer.value = false;
    scroll.scrollToCell(row, e.field);
    // 跳转后闪烁目标格：此前只滚不高亮，万行表里跳过去找不到人（cellClassName 合并读取本 flashKeys）
    core.flashCell(e.rowId, e.field);
  };

  // ===================== 提交 =====================
  const submitting = ref(false);
  /**
   * 模拟服务端校验：真实项目把这里换成接口调用即可——返回结构统一为 { idx, field, msg }，
   * 下方回填逻辑（写 cellErrors → 开校验面板 → 跳转首条）完全复用，不必改动。
   * 故意只放"前端不该知道"的规则，用来演示前后端两段校验的合并。
   */
  const serverValidate = async (payload: Record<string, any>[]): Promise<{ idx: number; field: string; msg: string }[]> => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 400);
    });
    const errs: { idx: number; field: string; msg: string }[] = [];
    payload.forEach((o, idx) => {
      if (Number(o.age) > 62 && !String(o.remark ?? '').trim()) {
        errs.push({ idx, field: 'remark', msg: '服务端：年龄超 62 岁须在备注中说明' });
      }
      if (/^test|测试/i.test(String(o.name ?? '').trim())) {
        errs.push({ idx, field: 'name', msg: '服务端：姓名疑似测试数据，请修正' });
      }
    });
    return errs;
  };

  const submit = async () => {
    // 1) 空行不参与提交：先剔除（可撤销），再全量重校（unique 计数会随之变化）
    const emptyN = emptyRowCount();
    if (emptyN) {
      snap();
      core.allRows.value = core.allRows.value.filter((r) => !rowIsEmpty(r));
      core.bumpData();
      ElMessage.info(`已移除并忽略 ${emptyN} 个空行`);
    }
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
      const rows = core.allRows.value;
      const payload = rows.map((r) => {
        const o: Record<string, any> = {};
        core.columnDefs.value.forEach((d) => {
          o[d.field] = r[d.field];
        });
        return o;
      });
      // 2) 服务端校验：错误逐格回填到前端错误表，定位口径与本地校验完全一致
      const serverErrs = await serverValidate(payload);
      if (serverErrs.length) {
        serverErrs.forEach((e) => {
          const row = rows[e.idx];
          if (row) core.setCellError(rowIdOf(row), e.field, e.msg);
        });
        errDrawer.value = true;
        const first = serverErrs[0];
        const firstRow = rows[first.idx];
        if (firstRow) {
          scroll.scrollToCell(firstRow, first.field);
          core.flashCell(rowIdOf(firstRow), first.field);
        }
        ElMessage.error(`服务端校验未通过 ${serverErrs.length} 处，已在表格标红`);
        return;
      }
      // 3) 通过：清脏标记 + 清草稿
      rows.forEach((r) => {
        clearDirty(r);
      });
      draft?.clearDraft();
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
    // 数据质量
    emptyRowCount,
    removeEmptyRows,
    removeDuplicateRows,
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

/**
 * useGridOps 的返回类型别名：导出框选统计（selectionRows/selectionCount/selectionStats）、
 * 行操作（addRow/insertRow/deleteSelected/duplicateSelected/clearAll）、数据质量清理、
 * 列操作、批量填充、校验面板跳转、提交等全部数据操作 API，供工具栏与右键菜单调用。
 */
export type GridOps = ReturnType<typeof useGridOps>;
