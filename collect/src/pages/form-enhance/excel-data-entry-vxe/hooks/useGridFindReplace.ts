// 查找 / 替换：全局或当前列范围，支持大小写敏感与整格匹配，命中高亮 + 跳转
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { GridScroll } from './useGridScroll';

export function useGridFindReplace(core: GridCore, scroll: GridScroll) {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  const findVisible = ref(false);
  const findText = ref('');
  const replaceText = ref('');
  const findScope = ref<'all' | 'col'>('all');
  const findCase = ref(false);
  const findWhole = ref(false);
  const findMatches = ref<{ rowId: string; field: string }[]>([]);
  const findMatchKeys = ref<Set<string>>(new Set());
  const findIdx = ref(0);

  const computeFindMatches = () => {
    const q = findCase.value ? findText.value : findText.value.toLowerCase();
    if (!q) {
      findMatches.value = [];
      findMatchKeys.value = new Set();
      return;
    }
    const fields = findScope.value === 'col' && core.currentCell.value ? [core.currentCell.value.field] : core.visibleDefs.value.map((d) => d.field);
    const list: { rowId: string; field: string }[] = [];
    for (const r of core.processedRows.value) {
      for (const f of fields) {
        const raw = String(r[f] ?? '');
        const tgt = findCase.value ? raw : raw.toLowerCase();
        const hit = findWhole.value ? tgt === q : tgt.includes(q);
        if (hit) list.push({ rowId: r.__id, field: f });
      }
    }
    findMatches.value = list;
    findMatchKeys.value = new Set(list.map((m) => core.errKey(m.rowId, m.field)));
    // -1 = 尚未定位任何匹配：此时点"查找下一个"应落在第一项（早期初始为 0 又先自增，首击永远跳过第一项）
    findIdx.value = -1;
  };
  watch([findText, findScope, findCase, findWhole], computeFindMatches, { immediate: true });

  const jumpToMatch = (m: { rowId: string; field: string }) => {
    const row = core.allRows.value.find((r) => r.__id === m.rowId);
    if (!row) return;
    scroll.scrollToCell(row, m.field);
  };
  /** 跳到下一个匹配项（循环）；findIdx 为 -1（尚未定位）时落在第一项 */
  const findNext = () => {
    if (!findMatches.value.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    findIdx.value = (findIdx.value + 1) % findMatches.value.length;
    jumpToMatch(findMatches.value[findIdx.value]);
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
    // 必须按"匹配对"逐项替换：早期用 Map 以 rowId 为键，同一行多列同时命中时互相覆盖，只替换一列
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
    findMatches,
    findMatchKeys,
    findIdx,
    findNext,
    replaceOne,
    replaceAll,
  };
}

export type GridFindReplace = ReturnType<typeof useGridFindReplace>;
