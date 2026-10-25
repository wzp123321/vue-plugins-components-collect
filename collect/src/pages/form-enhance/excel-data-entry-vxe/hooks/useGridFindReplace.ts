// 查找 / 替换：范围（全部列 / 当前列 / 当前选区）、大小写敏感、整格匹配、正则；命中高亮 + 跳转 + 命中列表
import { ref, watch, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';
import type { CellSelection } from './useCellSelection';

/** 命中列表上限：避免超大表（万行 × 多列）一次性计算/渲染过多命中项导致卡顿；超出部分只在计数中体现 */
const HIT_LIMIT = 500;

/** 查找重算防抖（ms）：大表每键全表扫描会卡输入，拖选时每帧重算更糟 */
const FIND_DEBOUNCE_MS = 200;

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

/**
 * 查找 / 替换：范围（全部列 / 当前列 / 当前选区）、大小写敏感、整格匹配、正则；命中高亮 + 跳转 + 命中列表。
 *
 * 在整体架构中的角色：本层是"只读查询 + 定向写回"模块——查找结果（findMatchKeys）供单元格高亮，
 * 跳转调用 useGridScroll.scrollToCell；替换则委托 core 写数据并校验。选区范围直接读 useCellSelection
 * 的 selRect，当前列范围跟随 currentCell。
 *
 * @param core 核心状态实例
 * @param scroll 滚动定位实例（跳转命中格）
 * @param sel 自研选区状态机（range='sel' 时取框选矩形）
 */
export const useGridFindReplace = (core: GridCore, scroll: GridScroll, sel: CellSelection) => {
  const findVisible = ref(false);
  const findText = ref('');
  const replaceText = ref('');
  const findScope = ref<'all' | 'col' | 'sel'>('all');
  const findCase = ref(false);
  const findWhole = ref(false);
  /** 正则模式：findText 直接作为正则源；非法时置 regexError 并中止匹配 */
  const findRegex = ref(false);
  const regexError = ref('');
  const findMatches = ref<{ rowId: string; field: string }[]>([]);
  const findMatchKeys = ref<Set<string>>(new Set());
  const findIdx = ref(0);
  /** 命中明细（带行/列标签与实际值），供查找条列表点击跳转 */
  const findHits = ref<{ rowId: string; field: string; rowLabel: string; colLabel: string; value: string }[]>([]);

  /** 匹配范围：列集合 + 行集合（选区范围取框选矩形） */
  const scopeOf = () => {
    const allFields = core.visibleDefs.value.map((d) => d.field);
    const rect = sel.selRect.value;
    if (findScope.value === 'sel' && rect) {
      return { fields: sel.rectFields(rect), rows: sel.rectRows(rect) };
    }
    if (findScope.value === 'col' && core.currentCell.value) {
      return { fields: [core.currentCell.value.field], rows: core.processedRows.value };
    }
    return { fields: allFields, rows: core.processedRows.value };
  };

  /**
   * 计算命中列表。
   * @param resetIdx 是否把"当前第几个命中"重置为 -1。
   *   ⚠️ 坑：跳转本身会改 currentCell → 触发重算；若这里无条件重置，点"查找下一个"后序号会被立刻打回 -1，
   *   用户永远看不到"第 N 个"。故只在关键词/范围/勾选项变化时重置，跳转引起的重算保留序号。
   */
  const computeFindMatches = (resetIdx = true) => {
    regexError.value = '';
    const q = findText.value;
    if (!q) {
      findMatches.value = [];
      findMatchKeys.value = new Set();
      findHits.value = [];
      findIdx.value = -1;
      return;
    }
    let re: RegExp | null = null;
    if (findRegex.value) {
      try {
        re = new RegExp(q, findCase.value ? '' : 'i');
      } catch {
        regexError.value = '正则表达式无效';
        findMatches.value = [];
        findMatchKeys.value = new Set();
        findHits.value = [];
        findIdx.value = -1;
        return;
      }
    }
    const tgt = findCase.value ? q : q.toLowerCase();
    const { fields, rows } = scopeOf();
    const labelField = core.visibleDefs.value[0]?.field;
    const list: { rowId: string; field: string }[] = [];
    const hits: { rowId: string; field: string; rowLabel: string; colLabel: string; value: string }[] = [];
    rows.forEach((r) => {
      fields.forEach((f) => {
        const raw = String(r[f] ?? '');
        let hit: boolean;
        if (re) hit = re.test(raw);
        else {
          const s = findCase.value ? raw : raw.toLowerCase();
          hit = findWhole.value ? s === tgt : s.includes(tgt);
        }
        // 原 continue 的反条件写法：未命中才跳过
        if (hit) {
          list.push({ rowId: rowIdOf(r), field: f });
          if (hits.length < HIT_LIMIT) {
            hits.push({
              rowId: rowIdOf(r),
              field: f,
              rowLabel: labelField ? String(r[labelField] ?? '') : '',
              colLabel: core.labelOf(f),
              value: raw,
            });
          }
        }
      });
    });
    findMatches.value = list;
    findMatchKeys.value = new Set(list.map((m) => core.errKey(m.rowId, m.field)));
    findHits.value = hits;
    if (resetIdx) {
      // -1 = 尚未定位任何匹配：此时点"查找下一个"应落在第一项（早期初始为 0 又先自增，首击永远跳过第一项）
      findIdx.value = -1;
    } else if (findIdx.value >= list.length) {
      // 跳转引起的重算：命中数变少时把序号夹到有效范围
      findIdx.value = list.length ? list.length - 1 : -1;
    }
  };
  // ===================== 触发重算（防抖） =====================
  let findTimer: number | null = null;
  /** 延迟重算：用于高频变化源（输入、拖选）；resetIdx=false 用于跳转引起的重算（保留"第 N 个"） */
  const scheduleCompute = (resetIdx = true) => {
    if (findTimer) window.clearTimeout(findTimer);
    findTimer = window.setTimeout(() => {
      findTimer = null;
      computeFindMatches(resetIdx);
    }, FIND_DEBOUNCE_MS);
  };
  // 关键词：清空立即生效（点清空按钮不该等 200ms），有词则防抖
  watch(findText, () => {
    if (!findText.value) computeFindMatches();
    else scheduleCompute();
  });
  // 勾选项/范围是低频操作，立即重算并重置序号
  watch([findScope, findCase, findWhole, findRegex], () => computeFindMatches(true));
  // 选区/当前格在拖选时每帧都变，走防抖；跳转本身也会改 currentCell，故不重置"第 N 个"
  watch([() => sel.selRect.value, () => core.currentCell.value], () => scheduleCompute(false));
  onBeforeUnmount(() => {
    if (findTimer) window.clearTimeout(findTimer);
  });
  computeFindMatches();

  const jumpToMatch = (m: { rowId: string; field: string }) => {
    const row = core.allRows.value.find((r) => rowIdOf(r) === m.rowId);
    if (!row) return;
    scroll.scrollToCell(row, m.field);
  };
  /** 跳到下一个匹配项（循环）；findIdx 为 -1（尚未定位）时落在第一项 */
  const findNext = () => {
    if (!findMatches.value.length) {
      ElMessage.info(regexError.value || '未找到匹配项');
      return;
    }
    findIdx.value = (findIdx.value + 1) % findMatches.value.length;
    jumpToMatch(findMatches.value[findIdx.value]);
  };
  /** 跳到指定命中（命中列表点击） */
  const jumpToHit = (i: number) => {
    const m = findMatches.value[i];
    if (!m) return;
    findIdx.value = i;
    jumpToMatch(m);
  };
  /** 替换一处（未定位匹配时替第一项）；替换后重算命中并停在同一序号，保持滚动定位 */
  const replaceOne = () => {
    if (!findMatches.value.length) return;
    // 未定位匹配时（findIdx=-1）替换第一项；定位后替换当前项
    const target = findIdx.value >= 0 ? findIdx.value : 0;
    const m = findMatches.value[target];
    const row = core.allRows.value.find((r) => rowIdOf(r) === m.rowId);
    if (!row) return;
    core.commitCells('替换', [row], () => {
      row[m.field] = replaceText.value;
      markDirty(row);
      core.validateCell(row, m.field);
    });
    computeFindMatches();
    // 停在同一序号（替换后若该项仍命中可继续替换），并保持滚动定位，避免"替完找不到人"
    findIdx.value = Math.min(target, findMatches.value.length - 1);
    if (findIdx.value >= 0) jumpToMatch(findMatches.value[findIdx.value]);
    ElMessage.success('已替换 1 处');
  };
  const replaceAll = () => {
    if (!findMatches.value.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    // ⚠️ 坑：必须按"匹配对"逐项替换——早期用 Map 以 rowId 为键，同一行多列同时命中时互相覆盖，只替换一列。
    // 这里改为遍历 findMatches（每 (rowId,field) 一对），逐格写回，避免漏替换。
    const rowMap = new Map(core.allRows.value.map((r) => [rowIdOf(r), r]));
    // 受影响行按 rowId 去重后交给增量事务（一行可能命中多列）
    const touched = [...new Set(findMatches.value.map((m) => rowMap.get(m.rowId)).filter((r): r is any => !!r))];
    let n = 0;
    core.commitCells('全部替换', touched, () => {
      findMatches.value.forEach((m) => {
        const row = rowMap.get(m.rowId);
        // 原 continue 的反条件写法：行不存在才跳过
        if (row) {
          row[m.field] = replaceText.value;
          markDirty(row);
          core.validateCell(row, m.field);
          n++;
        }
      });
    });
    computeFindMatches();
    ElMessage.success(`已替换 ${n} 处`);
  };

  return {
    findVisible,
    findText,
    replaceText,
    findScope,
    findCase,
    findWhole,
    findRegex,
    regexError,
    findMatches,
    findMatchKeys,
    findHits,
    findIdx,
    findNext,
    jumpToHit,
    replaceOne,
    replaceAll,
  };
}

/**
 * useGridFindReplace 的返回类型别名：导出查找面板状态（findVisible/findText/.../findHits/findIdx）
 * 与动作（findNext/jumpToHit/replaceOne/replaceAll），供查找条组件绑定。
 */
export type GridFindReplace = ReturnType<typeof useGridFindReplace>;
