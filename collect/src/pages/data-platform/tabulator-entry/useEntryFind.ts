// 查找 / 替换：整表记录扫描（DOM 模型下直接遍历行对象，比 Univer 的画布坐标扫描更直接）
// ============================================================================
// 与 Univer 版的关系：能力一致（子串/整格匹配、大小写、替换单个/全部、命中计数、逐项跳转），
// 仅命中坐标的表达从「A1」改成「数据下标 + 字段」，高亮也由「setBackground」改成「DOM class」。
// 查找条 UI（FindBar）与 Univer 版共用同一份组件（props 契约一致）。
// ============================================================================
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { EntrySheet } from './useEntrySheet';
import type { ColDef } from './schema';

/** 命中项：数据行下标 + 字段名 */
interface Hit {
  dataIndex: number;
  field: string;
}

export const useEntryFind = (sheetApi: EntrySheet, defs: { value: ColDef[] }) => {
  const findVisible = ref(false);
  const findText = ref('');
  const replaceText = ref('');
  const matchCase = ref(false);
  const matchWhole = ref(false);
  const hitCount = ref(0);
  const hitIndex = ref(-1);
  const busy = ref(false);

  /** 当前命中列表（用于跳转与替换） */
  let hits: Hit[] = [];
  const isBlank = (v: unknown): boolean => v === null || v === undefined || v === '';

  /** 扫描整表，返回命中的「数据下标 + 字段」列表 */
  const scan = (q: string): Hit[] => {
    const out: Hit[] = [];
    const needle = matchCase.value ? q : q.toLowerCase();
    const records = sheetApi.readRecords();
    records.forEach((rec, i) => {
      defs.value.forEach((d) => {
        const raw = rec[d.field];
        if (isBlank(raw)) return;
        const cell = String(raw);
        const hay = matchCase.value ? cell : cell.toLowerCase();
        const ok = matchWhole.value ? hay === needle : hay.includes(needle);
        if (ok) out.push({ dataIndex: i, field: d.field });
      });
    });
    return out;
  };

  /** 重算命中：扫描 → 计数 → 高亮（命中过多时只画前若干，避免逐格操作拖慢） */
  const recompute = () => {
    const q = findText.value.trim();
    if (!q) {
      hits = [];
      hitCount.value = 0;
      hitIndex.value = -1;
      sheetApi.markFind([]);
      return;
    }
    busy.value = true;
    try {
      hits = scan(q);
      hitCount.value = hits.length;
      hitIndex.value = hits.length ? 0 : -1;
      sheetApi.markFind(hits.slice(0, 800));
    } finally {
      busy.value = false;
    }
  };

  const jumpTo = (i: number) => {
    if (!hits.length) return;
    const idx = ((i % hits.length) + hits.length) % hits.length;
    hitIndex.value = idx;
    sheetApi.scrollToRow(hits[idx].dataIndex);
  };

  const findNext = () => {
    if (!hits.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    jumpTo(hitIndex.value + 1);
  };

  /** 替换当前命中，并重算（游标尽量停在原位） */
  const replaceOne = () => {
    if (!hits.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    const at = hitIndex.value >= 0 ? hitIndex.value : 0;
    const hit = hits[at];
    if (!hit) return;
    const records = sheetApi.readRecords();
    records[hit.dataIndex] = { ...records[hit.dataIndex], [hit.field]: replaceText.value };
    sheetApi.writeRecords(records);
    ElMessage.success('已替换 1 处');
    recompute();
    if (hits.length) jumpTo(Math.min(at, hits.length - 1));
  };

  /** 全部替换 */
  const replaceAll = () => {
    if (!hits.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    const records = sheetApi.readRecords();
    const value = replaceText.value;
    hits.forEach((h) => {
      records[h.dataIndex] = { ...records[h.dataIndex], [h.field]: value };
    });
    sheetApi.writeRecords(records);
    ElMessage.success(`已替换 ${hits.length} 处`);
    recompute();
  };

  const close = () => {
    findVisible.value = false;
    hits = [];
    hitCount.value = 0;
    hitIndex.value = -1;
    sheetApi.markFind([]);
  };

  const open = () => {
    findVisible.value = true;
    if (findText.value.trim()) recompute();
  };

  /** 全局搜索（工具条常驻输入框）：输入即高亮 + 刷新命中计数 */
  let quickTimer: number | undefined;
  const quickSearch = (text: string) => {
    findText.value = text;
    window.clearTimeout(quickTimer);
    quickTimer = window.setTimeout(() => {
      if (text.trim()) recompute();
      else {
        hits = [];
        hitCount.value = 0;
        hitIndex.value = -1;
        sheetApi.markFind([]);
      }
    }, 220);
  };

  return {
    findVisible,
    findText,
    replaceText,
    matchCase,
    matchWhole,
    hitCount,
    hitIndex,
    busy,
    open,
    close,
    quickSearch,
    recompute,
    findNext,
    replaceOne,
    replaceAll,
  };
};

export type EntryFind = ReturnType<typeof useEntryFind>;
