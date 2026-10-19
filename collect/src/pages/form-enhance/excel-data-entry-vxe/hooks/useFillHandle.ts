// 拖拽填充手柄：锚点定位 / 手柄显隐 / 纵向+横向填充（方向感知 + 序列填充）/ 双击填至末行
// 与快捷键填充互补：Ctrl+D = 向下填充，Ctrl+R = 向右填充，Ctrl+Enter = 整区填当前格值；
// 本手柄 = 把选区边缘的值拖写到选区之外的新行/新列（Excel 填充柄语义）。
// 序列填充：数字按首两格差推算、日期按天差推算（+1 天起步），文本/下拉复制。
// 轴向判定：按指针相对按下点的位移主轴（|dx| > |dy| 为横向），比"看落点在哪一轴之外"更符合手感。
import { reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';

/**
 * 把 YYYY-MM-DD（或宽松日期）解析为 Date；非法/空返回 null。
 * 仅接受四位年-两位月-两位日，避免把其它数字误当日期。
 * @param v 原始值
 * @returns 解析后的 Date，或 null
 */
const parseDate = (v: any): Date | null => {
  if (!v) return null;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
};
/**
 * 给日期加 N 天并以 YYYY-MM-DD 输出；setDate 自动处理跨月与闰年。
 * 源为空时退化为"今天 + days"，保证序列至少能向下延续。
 * @param v 基准日期（YYYY-MM-DD）
 * @param days 要加的天数（可为负）
 */
const addDays = (v: any, days: number): string => {
  const d = parseDate(v) ?? new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

/**
 * 拖拽填充手柄（Excel 填充柄）：锚点定位 + 手柄显隐 + 纵向/横向序列填充 + 双击填至末行。
 *
 * 在整体架构中的角色：与快捷键填充（useGridKeys 的 Ctrl+D/Ctrl+R/Ctrl+Enter）互补，
 * 本手柄负责"把选区边缘的值拖写到选区之外的新行/新列"。它读取 sel.selRect 取源、读取 core 写数据，
 * 落点坐标一律走 document.elementFromPoint + colid/rowid 解析（不依赖 vxe 内部 API）。
 *
 * 关键算法：序列填充按"首两格差"推算——数字按等差、日期按天差、文本/下拉常量复制；
 * 轴向按指针相对按下点的位移主轴（|dx|>|dy| 横向）判定，比"看落点在哪轴之外"更跟手。
 *
 * @param core  核心状态实例
 * @param tableRef vxe 实例（getCellElement / getColumnByField 定位单元格）
 * @param sel   自研选区状态机（selRect 提供源矩形）
 * @param gridBox 网格容器（定位手柄 / 蚂蚁线的相对坐标基准）
 */
export function useFillHandle(
  core: GridCore,
  tableRef: Ref<any>,
  sel: CellSelection,
  gridBox: Ref<HTMLElement | undefined>,
) {
  // ===================== 手柄定位 =====================
  // 锚点格 = 矩形选区的右下角（末行 × 末列），与 Excel 一致——早期锚在 focus 端，
  // 从左上往右下框选时手柄位置才对，反向框选（focus 落在左上）手柄会跑到左上角。
  // ⚠️ 坑：注意不能用 vxe 的 getActiveCell——它不是 OSS 表格实例方法（右键取格用它会拿到过期值），
  // mouse-config.selected 关闭后它只在编辑期有值；这里一律用 selRect 右下角，无选区时退化 currentCell。
  const fillAnchor = (): { row: any; field: string } | null => {
    const rect = sel.selRect.value;
    if (rect) {
      // 选区是索引四元组：右下角 = bottomIdx 行 × rightIdx 列，直接取，不用再按行 id 过滤
      const row = core.processedRows.value[rect.bottomIdx];
      const field = core.visibleDefs.value[rect.rightIdx]?.field;
      if (row && field) return { row, field };
    }
    return core.currentCell.value;
  };
  const fillHandle = reactive({ show: false, style: { top: '0px', left: '0px' } });
  /** 拖拽填充预览的闪烁格集合（与 core.flashKeys 单格跳转闪烁相互独立，由 cellClassName 合并读取） */
  const flashKeys = ref<Set<string>>(new Set());
  const hideFillHandle = () => {
    fillHandle.show = false;
  };
  const refreshFillHandle = () => {
    const ac = fillAnchor();
    if (!ac?.row || !ac?.field) {
      fillHandle.show = false;
      return;
    }
    const column = tableRef.value?.getColumnByField?.(ac.field);
    const cellEl = column ? tableRef.value?.getCellElement?.(ac.row, column) : null;
    const box = gridBox.value;
    if (!cellEl || !box) {
      fillHandle.show = false;
      return;
    }
    const cr = cellEl.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    fillHandle.style.top = `${cr.bottom - br.top - 5}px`;
    fillHandle.style.left = `${cr.right - br.left - 5}px`;
    fillHandle.show = true;
  };
  // 当前格移动 / 选区变化时手柄跟随（selRect 覆盖 anchor/focus 的任何变化，含 Ctrl+A 与序号选行）
  watch(
    () => [core.currentCell.value, sel.selRect.value],
    () => refreshFillHandle(),
  );

  // ===================== 坐标解析 =====================
  const fieldsNow = () => core.visibleDefs.value.map((d) => d.field);
  const rowIdxFromPoint = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const rowid = el?.closest('.vxe-body--row')?.getAttribute('rowid');
    if (!rowid) return -1;
    return core.processedRows.value.findIndex((r) => r.__id === rowid);
  };
  const colIdxFromPoint = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const colid = el?.closest('.vxe-body--column')?.getAttribute('colid');
    if (!colid) return -1;
    const field = tableRef.value?.getColumnById?.(colid)?.field;
    return field ? fieldsNow().indexOf(field) : -1;
  };

  /** 选区范围信息（行区间 + 列区间），无选区时退化为锚点单格 */
  const rectRange = () => {
    const rows = core.processedRows.value;
    const fields = fieldsNow();
    const rect = sel.selRect.value;
    if (!rect) {
      const cur = core.currentCell.value;
      if (!cur) return null;
      const ri = rows.findIndex((r) => r.__id === cur.row.__id);
      const ci = fields.indexOf(cur.field);
      if (ri < 0 || ci < 0) return null;
      // 单格无选区时也允许横向/纵向填充：行集合退化为该行本身
      return { rows, fields, topIdx: ri, bottomIdx: ri, leftIdx: ci, rightIdx: ci };
    }
    return {
      rows,
      fields,
      topIdx: rect.topIdx,
      bottomIdx: rect.bottomIdx,
      leftIdx: rect.leftIdx,
      rightIdx: rect.rightIdx,
    };
  };

  /** 纵向序列求值器：以选区首行为基准，数字按首两行差、日期按天差延续；文本复制 */
  const verticalSeries = (srcField: string, rows: any[], topIdx: number, bottomIdx: number) => {
    const def = core.columnDefs.value.find((d) => d.field === srcField);
    const type = def?.type;
    const seed: any[] = [];
    for (let i = topIdx; i <= bottomIdx; i++) seed.push(rows[i]?.[srcField]);
    const first = seed[0];
    let step = 0;
    if (type === 'number') {
      const f = Number(first);
      step = seed.length >= 2 && isFinite(f) ? Number(seed[1]) - f : 0;
      if (!isFinite(step)) step = 0;
    } else if (type === 'date') {
      const d0 = parseDate(first);
      const d1 = seed.length >= 2 ? parseDate(seed[1]) : null;
      step = d0 && d1 ? Math.round((d1.getTime() - d0.getTime()) / 86400000) : 1;
      if (!isFinite(step)) step = 1;
    }
    return (t: number): any => {
      if (first === '' || first == null) return first; // 源为空：复制
      const k = t - topIdx;
      if (type === 'number') return Number((Number(first) + step * k).toFixed(6));
      if (type === 'date') return addDays(first, step * k);
      return first; // 文本/下拉：常量复制
    };
  };

  /** 横向序列求值器：以选区最左列为基准，逐行独立推算（数字按首两列差、日期按天差） */
  const horizontalSeries = (row: any, leftIdx: number, rightIdx: number, fields: string[]) => {
    const def = core.columnDefs.value.find((d) => d.field === fields[leftIdx]);
    const type = def?.type;
    const seed: any[] = [];
    for (let i = leftIdx; i <= rightIdx; i++) seed.push(row[fields[i]]);
    const first = seed[0];
    let step = 0;
    if (type === 'number') {
      const f = Number(first);
      step = seed.length >= 2 && isFinite(f) ? Number(seed[1]) - f : 0;
      if (!isFinite(step)) step = 0;
    } else if (type === 'date') {
      const d0 = parseDate(first);
      const d1 = seed.length >= 2 ? parseDate(seed[1]) : null;
      step = d0 && d1 ? Math.round((d1.getTime() - d0.getTime()) / 86400000) : 1;
      if (!isFinite(step)) step = 1;
    }
    return (colIdx: number): any => {
      if (first === '' || first == null) return first;
      const k = colIdx - leftIdx;
      if (type === 'number') return Number((Number(first) + step * k).toFixed(6));
      if (type === 'date') return addDays(first, step * k);
      return first;
    };
  };

  /** 纵向填充：把 [fromIdx, toIdx] 区间按序列写入 srcField 列，返回写入格数 */
  const applyVertical = (fromIdx: number, toIdx: number, srcField: string) => {
    const rg = rectRange();
    if (!rg) return 0;
    const series = verticalSeries(srcField, rg.rows, rg.topIdx, rg.bottomIdx);
    let n = 0;
    for (let i = fromIdx; i <= toIdx; i++) {
      const r = rg.rows[i];
      if (!r) continue;
      r[srcField] = series(i);
      r.__dirty = true;
      core.validateCell(r, srcField);
      n++;
    }
    return n;
  };

  /** 横向填充：把 [fromCol, toCol] 列区间按逐行序列写入选区所有行，返回写入格数 */
  const applyHorizontal = (fromCol: number, toCol: number) => {
    const rg = rectRange();
    if (!rg) return 0;
    let n = 0;
    for (let i = rg.topIdx; i <= rg.bottomIdx; i++) {
      const r = rg.rows[i];
      if (!r) continue;
      const series = horizontalSeries(r, rg.leftIdx, rg.rightIdx, rg.fields);
      for (let c = fromCol; c <= toCol; c++) {
        const f = rg.fields[c];
        if (!f) continue;
        r[f] = series(c);
        r.__dirty = true;
        core.validateCell(r, f);
        n++;
      }
    }
    return n;
  };

  // ===================== 拖拽填充 =====================
  // ⚠️ 坑：手柄元素用了 @pointerdown.prevent 就收不到 dblclick 事件——双击要自己按时间戳判定。
  // 双击检测：手柄上的 pointerdown 用了 .prevent，会吞掉兼容性鼠标事件（dblclick 收不到），
  // 故在此自测双击间隔；命中即执行"填充至末行"，不再进入拖拽。
  // 阈值取 420ms（Windows 默认双击间隔 500ms 留余量）；真拖拽结束后清零，避免"拖完立刻按下"被误判双击
  let lastDownAt = 0;

  /** 按下填充柄开始拖拽：按指针位移主轴决定纵向/横向，拖拽过程闪烁预览目标区 */
  const startFill = (ev?: PointerEvent) => {
    const now = Date.now();
    if (now - lastDownAt < 420) {
      lastDownAt = 0;
      fillToEnd();
      return;
    }
    lastDownAt = now;
    const anchor = fillAnchor();
    const rg = rectRange();
    if (!anchor?.row || !anchor?.field || !rg) return;
    const srcField = anchor.field;
    const startX = ev?.clientX ?? 0;
    const startY = ev?.clientY ?? 0;
    let filling = false;

    // 目标 → 实际填充范围（仅覆盖原选区之外的新行/新列，与 Excel 一致）；
    // 落在原选区内返回 null（不填充）
    const vRange = (tIdx: number): [number, number] | null => {
      if (tIdx > rg.bottomIdx) return [rg.bottomIdx + 1, tIdx];
      if (tIdx < rg.topIdx) return [tIdx, rg.topIdx - 1];
      return null;
    };
    const hRange = (tCol: number): [number, number] | null => {
      if (tCol > rg.rightIdx) return [rg.rightIdx + 1, tCol];
      if (tCol < rg.leftIdx) return [tCol, rg.leftIdx - 1];
      return null;
    };
    /** 轴向：指针位移主轴；没动够时返回 null（避免抖动误判） */
    const axisOf = (x: number, y: number): 'v' | 'h' | null => {
      const dx = Math.abs(x - startX);
      const dy = Math.abs(y - startY);
      if (dx < 4 && dy < 4) return null;
      return dx > dy ? 'h' : 'v';
    };

    const previewKeys = (x: number, y: number) => {
      const axis = axisOf(x, y);
      const keys = new Set<string>();
      if (axis === 'v') {
        const r = vRange(rowIdxFromPoint(x, y));
        if (!r) return keys;
        for (let i = r[0]; i <= r[1]; i++) {
          const row = rg.rows[i];
          if (!row) continue;
          for (const f of rg.fields.slice(rg.leftIdx, rg.rightIdx + 1)) keys.add(core.errKey(row.__id, f));
        }
      } else if (axis === 'h') {
        const c = hRange(colIdxFromPoint(x, y));
        if (!c) return keys;
        for (let i = rg.topIdx; i <= rg.bottomIdx; i++) {
          const row = rg.rows[i];
          if (!row) continue;
          for (let k = c[0]; k <= c[1]; k++) {
            const f = rg.fields[k];
            if (f) keys.add(core.errKey(row.__id, f));
          }
        }
      }
      return keys;
    };

    const move = (e: PointerEvent) => {
      filling = true;
      flashKeys.value = previewKeys(e.clientX, e.clientY);
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (!filling) return;
      filling = false;
      const axis = axisOf(e.clientX, e.clientY);
      flashKeys.value = new Set();
      if (!axis) return; // 只是点了一下手柄，不填充
      if (axis === 'v') {
        const tIdx = rowIdxFromPoint(e.clientX, e.clientY);
        const range = tIdx >= 0 ? vRange(tIdx) : null;
        if (!range) return;
        const down = tIdx > rg.bottomIdx;
        // 方向感知的填充源（Excel 语义）：向下拖取选区末行、向上拖取首行；
        // 序列仍以选区首行为基准（verticalSeries 内部按 topIdx 推算），行号连续故自然衔接
        let n = 0;
        core.commitCells('拖拽填充', rg.rows.slice(range[0], range[1] + 1), () => {
          n = applyVertical(range[0], range[1], srcField);
        });
        ElMessage.success(n ? `已向${down ? '下' : '上'}填充 ${n} 格` : '没有可填充的行');
      } else {
        const tCol = colIdxFromPoint(e.clientX, e.clientY);
        const range = tCol >= 0 ? hRange(tCol) : null;
        if (!range) return;
        const right = tCol > rg.rightIdx;
        let n = 0;
        core.commitCells('拖拽填充', rg.rows.slice(rg.topIdx, rg.bottomIdx + 1), () => {
          n = applyHorizontal(range[0], range[1]);
        });
        ElMessage.success(n ? `已向${right ? '右' : '左'}填充 ${n} 格` : '没有可填充的列');
      }
      lastDownAt = 0; // 真拖拽后清零双击计时
      setTimeout(() => (flashKeys.value = new Set()), 600);
      refreshFillHandle();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /**
   * 双击填充柄：纵向延续到"参照列最后一个非空行"（Excel 双击小黑点）。
   * 参照列 = 选区左侧相邻可见列；选区已在首列时取右侧相邻列；都没有则退回选区首列。
   */
  const fillToEnd = () => {
    const rg = rectRange();
    if (!rg) return;
    const fields = rg.fields;
    const refIdx = rg.leftIdx > 0 ? rg.leftIdx - 1 : Math.min(rg.rightIdx + 1, fields.length - 1);
    const refField = fields[refIdx];
    const srcField = fields[rg.rightIdx];
    if (!refField || !srcField) return;
    // 从选区末行往下找参照列最后一个非空行（参照列自身上方已填满时才能可靠推断数据区末尾）
    let last = -1;
    for (let i = rg.rows.length - 1; i > rg.bottomIdx; i--) {
      const v = rg.rows[i][refField];
      if (v !== null && v !== undefined && v !== '') {
        last = i;
        break;
      }
    }
    if (last < 0) {
      ElMessage.info('参照列下方没有数据，无法自动填充');
      return;
    }
    let n = 0;
    core.commitCells('填充至末行', rg.rows.slice(rg.bottomIdx + 1, last + 1), () => {
      n = applyVertical(rg.bottomIdx + 1, last, srcField);
    });
    ElMessage.success(n ? `已向下填充 ${n} 格（至参照列末行）` : '没有可填充的行');
    setTimeout(() => (flashKeys.value = new Set()), 600);
    refreshFillHandle();
  };

  return { fillHandle, flashKeys, hideFillHandle, refreshFillHandle, startFill, fillToEnd };
}

/**
 * useFillHandle 的返回类型别名：导出 { fillHandle, flashKeys, hideFillHandle, refreshFillHandle,
 * startFill, fillToEnd }，供 useGridMouse 透出到模板渲染填充柄与预览闪烁。
 */
export type GridFillHandle = ReturnType<typeof useFillHandle>;
