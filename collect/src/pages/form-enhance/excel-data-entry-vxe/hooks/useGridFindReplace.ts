// 查找 / 替换：范围（全部列 / 当前列 / 当前选区）、大小写敏感、整格匹配、正则；命中高亮 + 跳转 + 命中列表
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';
import type { CellSelection } from './useCellSelection';

/** 命中列表上限：避免超大表（万行 × 多列）一次性计算/渲染过多命中项导致卡顿；超出部分只在计数中体现 */
const HIT_LIMIT = 500;

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
export function useGridFindReplace(core: GridCore, scroll: GridScroll, sel: CellSelection) {
  const snap = () => core.pushSnapshot(core.snapshotNow());

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
      return { fields: rect.fields, rows: core.processedRows.value.filter((r) => rect.rowIds.has(r.__id)) };
    }
    if (findScope.value === 'col' && core.currentCell.value) {
      return { fields: [core.currentCell.value.field], rows: core.processedRows.value };
    }
    return { fields: allFields, rows: core.processedRows.value };
  };

  const computeFindMatches = () => {
    regexError.value = '';
    const q = findText.value;
    if (!q) {
      findMatches.value = [];
      findMatchKeys.value = new Set();
      findHits.value = [];
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
        return;
      }
    }
    const tgt = findCase.value ? q : q.toLowerCase();
    const { fields, rows } = scopeOf();
    const labelField = core.visibleDefs.value[0]?.field;
    const list: { rowId: string; field: string }[] = [];
    const hits: { rowId: string; field: string; rowLabel: string; colLabel: string; value: string }[] = [];
    for (const r of rows) {
      for (const f of fields) {
        const raw = String(r[f] ?? '');
        let hit: boolean;
        if (re) hit = re.test(raw);
        else {
          const s = findCase.value ? raw : raw.toLowerCase();
          hit = findWhole.value ? s === tgt : s.includes(tgt);
        }
        if (!hit) continue;
        list.push({ rowId: r.__id, field: f });
        if (hits.length < HIT_LIMIT) {
          hits.push({
            rowId: r.__id,
            field: f,
            rowLabel: labelField ? String(r[labelField] ?? '') : '',
            colLabel: core.labelOf(f),
            value: raw,
          });
        }
      }
    }
    findMatches.value = list;
    findMatchKeys.value = new Set(list.map((m) => core.errKey(m.rowId, m.field)));
    findHits.value = hits;
    // -1 = 尚未定位任何匹配：此时点"查找下一个"应落在第一项（早期初始为 0 又先自增，首击永远跳过第一项）
    findIdx.value = -1;
  };
  // 选区/当前格变化也要重算（range=选区时框选范围即匹配范围；range=当前列时列随当前格走）
  watch(
    [findText, findScope, findCase, findWhole, findRegex, () => sel.selRect.value, () => core.currentCell.value],
    computeFindMatches,
    { immediate: true },
  );

  const jumpToMatch = (m: { rowId: string; field: string }) => {
    const row = core.allRows.value.find((r) => r.__id === m.rowId);
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
    const row = core.allRows.value.find((r) => r.__id === m.rowId);
    if (!row) return;
    snap();
    row[m.field] = replaceText.value;
    row.__dirty = true;
    core.validateCell(row, m.field);
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
    snap();
    // ⚠️ 坑：必须按"匹配对"逐项替换——早期用 Map 以 rowId 为键，同一行多列同时命中时互相覆盖，只替换一列。
    // 这里改为遍历 findMatches（每 (rowId,field) 一对），逐格写回，避免漏替换。
    const rowMap = new Map(core.allRows.value.map((r) => [r.__id, r]));
    let n = 0;
    for (const m of findMatches.value) {
      const row = rowMap.get(m.rowId);
      if (!row) continue;
      row[m.field] = replaceText.value;
      row.__dirty = true;
      core.validateCell(row, m.field);
      n++;
    }
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
