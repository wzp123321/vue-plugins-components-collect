// 查找 / 替换：整表快照扫描（不用 Univer 的 FTextFinder）
// ============================================================================
// 为什么不用 FTextFinder：在本工程的 preset 组合下（core + sort + filter + find-replace
// + data-validation + conditional-formatting），`api.createTextFinderAsync(q)` 能返回实例，
// 但 `findAll()` 对任何关键词都返回 0（连单元格自身的原值都搜不到），并且
// `matchCaseAsync()` / `matchEntireCellAsync()` 会永久挂起、永不 resolve —— 会让查找条
// 卡在 loading 且命中数恒为 0。实测数据：C2 = '研发'、lastRow = 200，findAll('研发') = 0。
//
// 于是改成自己扫：一次 `getValues()` 把表头以下整块读成二维数组，在内存里做子串/整格匹配。
// 好处是行为完全可预期（大小写、整格、替换范围都由本层说了算），代价是大表每次搜索要读一次全表
// 值（200 行 × 8 列 ≈ 1.6k 格，1 万行 × 8 列 ≈ 8 万格，仍在毫秒级）。
//
// 与 vxe 版的差别：vxe 版在行对象模型上直接匹配字段；这里按工作表坐标匹配，命中结果用 A1 表达。
// ============================================================================
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { EntrySheet } from './useEntrySheet';
import { HEADER_ROW, type ColDef } from './schema';

/** 命中高亮底色（浅黄，与校验错误的浅红区分） */
const HIT_BG = '#fff3cd';
/** 一次最多画多少个高亮：命中太多时逐格 setBackground 会明显拖慢（每格都是一条命令） */
const MAX_PAINT = 800;

/** 列号 → Excel 列字母（0 → A，25 → Z，26 → AA） */
const colLetter = (index: number): string => {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
};

/**
 * 查找替换层。
 * @param sheetApi 网格读写通道（读整表快照 / 画高亮 / 跳转）
 * @param defs     列定义（决定扫描宽度，避免把右侧空列一起读进来）
 */
export const useEntryFind = (sheetApi: EntrySheet, defs: { value: ColDef[] }) => {
  const findVisible = ref(false);
  const findText = ref('');
  const replaceText = ref('');
  const matchCase = ref(false);
  const matchWhole = ref(false);
  const hitCount = ref(0);
  const hitIndex = ref(-1);
  const busy = ref(false);

  /** 已画高亮的 A1 地址，关闭/重查时按此复原 */
  let painted: string[] = [];
  /** 缓存命中列表的 A1（展示计数与实际跳转都靠它） */
  let hits: string[] = [];

  const clearHitPaint = () => {
    const ws = sheetApi.sheet.value;
    if (ws) painted.forEach((a1) => ws.getRange(a1).setBackground(null));
    painted = [];
  };

  /** 读一次表头以下的整块值，返回命中单元格的 A1 列表（按行列顺序） */
  const scan = (q: string): string[] => {
    const ws = sheetApi.sheet.value;
    if (!ws || !q) return [];
    const lastRow = ws.getLastRow();
    const dataRows = lastRow - HEADER_ROW;
    const width = defs.value.length;
    if (dataRows <= 0 || width <= 0) return [];

    const matrix = ws.getRange(HEADER_ROW + 1, 0, dataRows, width).getValues();
    const needle = matchCase.value ? q : q.toLowerCase();
    const out: string[] = [];

    for (let r = 0; r < matrix.length; r += 1) {
      const row = matrix[r] ?? [];
      for (let c = 0; c < width; c += 1) {
        const raw = row[c];
        // 空值不参与匹配：既不算命中，也不该把"未填写"当成空串去命中空关键词
        if (raw !== null && raw !== undefined && raw !== '') {
          const cell = String(raw);
          const hay = matchCase.value ? cell : cell.toLowerCase();
          const hit = matchWhole.value ? hay === needle : hay.includes(needle);
          if (hit) out.push(`${colLetter(c)}${HEADER_ROW + 1 + r + 1}`);
        }
      }
    }
    return out;
  };

  /** 重算命中：扫描 → 计数 → 高亮（命中过多时只画前 MAX_PAINT 个） */
  const recompute = () => {
    const q = findText.value.trim();
    clearHitPaint();
    if (!q) {
      hits = [];
      hitCount.value = 0;
      hitIndex.value = -1;
      return;
    }
    busy.value = true;
    try {
      hits = scan(q);
      hitCount.value = hits.length;
      hitIndex.value = hits.length ? 0 : -1;
      const ws = sheetApi.sheet.value;
      if (ws) {
        const limit = Math.min(hits.length, MAX_PAINT);
        for (let i = 0; i < limit; i += 1) ws.getRange(hits[i]).setBackground(HIT_BG);
        painted = hits.slice(0, limit);
      }
    } finally {
      busy.value = false;
    }
  };

  /** 跳到第 i 个命中（循环取模） */
  const jumpTo = (i: number) => {
    const ws = sheetApi.sheet.value;
    if (!ws || !hits.length) return;
    const idx = ((i % hits.length) + hits.length) % hits.length;
    hitIndex.value = idx;
    ws.getRange(hits[idx]).activate();
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
    const ws = sheetApi.sheet.value;
    if (!ws || !hits.length) return;
    const at = hitIndex.value >= 0 ? hitIndex.value : 0;
    const a1 = hits[at];
    if (!a1) return;
    ws.getRange(a1).setValue(replaceText.value);
    ElMessage.success('已替换 1 处');
    recompute();
    if (hits.length) jumpTo(Math.min(at, hits.length - 1));
  };

  /** 全部替换 */
  const replaceAll = () => {
    const ws = sheetApi.sheet.value;
    if (!ws || !hits.length) {
      ElMessage.info('未找到匹配项');
      return;
    }
    const targets = hits.slice();
    const value = replaceText.value;
    targets.forEach((a1) => ws.getRange(a1).setValue(value));
    ElMessage.success(`已替换 ${targets.length} 处`);
    recompute();
  };

  /** 关闭查找条：清高亮、清状态 */
  const close = () => {
    findVisible.value = false;
    clearHitPaint();
    hits = [];
    hitCount.value = 0;
    hitIndex.value = -1;
  };

  /** 打开查找条（工具栏按钮 / Ctrl+F 之外的入口统一走这里） */
  const open = () => {
    findVisible.value = true;
    if (findText.value.trim()) recompute();
  };

  /**
   * 全局搜索（工具条常驻输入框）：输入即高亮 + 刷新命中计数，不走"打开查找条"。
   *
   * 与 vxe 版的语义差别：vxe 的 searchText 是"收窄行集"；Univer 的行集由原生筛选器管，
   * 硬在输入框里做行集收窄会和漏斗打架。所以这里退成"标黄 + 计数"，要收窄行集用列头漏斗。
   * 去抖 220ms：每次重算都会重画命中底色，逐键触发会闪。
   */
  let quickTimer: number | undefined;
  const quickSearch = (text: string) => {
    findText.value = text;
    window.clearTimeout(quickTimer);
    quickTimer = window.setTimeout(() => {
      if (text.trim()) {
        recompute();
        return;
      }
      clearHitPaint();
      hits = [];
      hitCount.value = 0;
      hitIndex.value = -1;
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
    clearHitPaint,
  };
};

export type EntryFind = ReturnType<typeof useEntryFind>;
