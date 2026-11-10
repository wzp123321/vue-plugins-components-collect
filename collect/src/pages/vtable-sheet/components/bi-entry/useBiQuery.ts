/**
 * BI 数据录入 —— 查询层（全局搜索 / 每列筛选 / 多列排序 / 查询 chips / 分页）
 *
 * 对齐 vxe 录入台的查询体验：搜索框 + 每列筛选 + 多列排序，并把当前查询态渲染成可单独清除的 chips。
 * 筛选与排序都在「前端内存」做（等价 vxe 的 remote 模式），这样切换列结构、撤销、导入后状态一致。
 *
 * ⚠️ 顺序固定：先筛选 → 再搜索 → 最后排序。排序必须在筛选之后，否则分页页码会跳。
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { isBlank, numOf, type BiCol, type BiRow } from './schema';

export type SortOrder = 'asc' | 'desc';

export interface SortRule {
  field: string;
  order: SortOrder;
}

/** 单列筛选：下拉/文本用 values（多选，空数组=不筛），数字用 min/max 区间 */
export interface ColFilter {
  field: string;
  values: string[];
  min?: number | null;
  max?: number | null;
}

export interface QueryChip {
  key: string;
  kind: 'search' | 'filter' | 'sort';
  label: string;
  remove: () => void;
}

export type ViewMode = 'virtual' | 'paged';

export const useBiQuery = (cols: Ref<BiCol[]>, rows: Ref<BiRow[]>) => {
  const searchText = ref('');
  const filters = ref<ColFilter[]>([]);
  const sorts = ref<SortRule[]>([]);
  const viewMode = ref<ViewMode>('virtual');
  const page = ref(1);
  const pageSize = ref(50);

  const visibleCols = computed(() => cols.value.filter((c) => c.visible));

  const matchFilter = (row: BiRow, f: ColFilter): boolean => {
    const v = row[f.field];
    if (typeof f.min === 'number' || typeof f.max === 'number') {
      const n = numOf(v);
      if (n === null) {
        return false;
      }
      if (typeof f.min === 'number' && n < f.min) {
        return false;
      }
      if (typeof f.max === 'number' && n > f.max) {
        return false;
      }
      return true;
    }
    if (!f.values.length) {
      return true;
    }
    return f.values.includes(String(v ?? ''));
  };

  const searched = computed(() => {
    const kw = searchText.value.trim().toLowerCase();
    const list = rows.value;
    if (!kw) {
      return list;
    }
    const fields = visibleCols.value.map((c) => c.field);
    return list.filter((r) => fields.some((f) => String(r[f] ?? '').toLowerCase().includes(kw)));
  });

  const processedRows: ComputedRef<BiRow[]> = computed(() => {
    let list = searched.value;
    const active = filters.value.filter(
      (f) => f.values.length > 0 || typeof f.min === 'number' || typeof f.max === 'number',
    );
    if (active.length) {
      list = list.filter((r) => active.every((f) => matchFilter(r, f)));
    }
    if (!sorts.value.length) {
      return list;
    }
    const rules = sorts.value;
    // 复制一份再排：不能就地改 processedRows 的源数组（records 是唯一真源）
    const copy = list.slice();
    copy.sort((a, b) => {
      let result = 0;
      rules.some((rule) => {
        const col = cols.value.find((c) => c.field === rule.field);
        const av = a[rule.field];
        const bv = b[rule.field];
        let diff = 0;
        if (col?.type === 'number') {
          const an = numOf(av);
          const bn = numOf(bv);
          if (an === null && bn === null) {
            diff = 0;
          } else if (an === null) {
            diff = -1;
          } else if (bn === null) {
            diff = 1;
          } else {
            diff = an - bn;
          }
        } else {
          diff = String(av ?? '').localeCompare(String(bv ?? ''), 'zh-CN');
        }
        if (diff !== 0) {
          result = rule.order === 'asc' ? diff : -diff;
          return true;
        }
        return false;
      });
      return result;
    });
    return copy;
  });

  const pageCount = computed(() => Math.max(1, Math.ceil(processedRows.value.length / pageSize.value)));

  const displayRows = computed(() => {
    if (viewMode.value !== 'paged') {
      return processedRows.value;
    }
    const start = (page.value - 1) * pageSize.value;
    return processedRows.value.slice(start, start + pageSize.value);
  });

  // 页码越界钳制：删行 / 改筛选后不会白屏
  const clampPage = () => {
    if (page.value > pageCount.value) {
      page.value = pageCount.value;
    }
    if (page.value < 1) {
      page.value = 1;
    }
  };

  // ============================ 筛选 ============================
  const filterOf = (field: string): ColFilter => {
    const hit = filters.value.find((f) => f.field === field);
    return hit ?? { field, values: [] };
  };

  const setFilter = (field: string, next: Partial<ColFilter>) => {
    const cur = filterOf(field);
    const merged: ColFilter = { ...cur, ...next, field };
    const empty =
      !merged.values.length && typeof merged.min !== 'number' && typeof merged.max !== 'number';
    filters.value = empty
      ? filters.value.filter((f) => f.field !== field)
      : [...filters.value.filter((f) => f.field !== field), merged];
    page.value = 1;
  };

  const clearFilter = (field: string) => {
    filters.value = filters.value.filter((f) => f.field !== field);
    page.value = 1;
  };

  // ============================ 排序 ============================
  const sortOf = (field: string): SortOrder | null => sorts.value.find((s) => s.field === field)?.order ?? null;

  /** 点表头排序：无 → 升 → 降 → 无；append 为真时保留其它列排序（多列排序） */
  const cycleSort = (field: string, append = false) => {
    const cur = sortOf(field);
    const rest = append ? sorts.value.filter((s) => s.field !== field) : [];
    if (cur === null) {
      sorts.value = [...rest, { field, order: 'asc' }];
    } else if (cur === 'asc') {
      sorts.value = [...rest, { field, order: 'desc' }];
    } else {
      sorts.value = rest;
    }
    page.value = 1;
  };

  const clearSort = (field?: string) => {
    sorts.value = field ? sorts.value.filter((s) => s.field !== field) : [];
    page.value = 1;
  };

  const clearAllQuery = () => {
    searchText.value = '';
    filters.value = [];
    sorts.value = [];
    page.value = 1;
  };

  // ============================ chips ============================
  const chips: ComputedRef<QueryChip[]> = computed(() => {
    const out: QueryChip[] = [];
    const kw = searchText.value.trim();
    if (kw) {
      out.push({ key: 'search', kind: 'search', label: `搜索：${kw}`, remove: () => { searchText.value = ''; } });
    }
    filters.value.forEach((f) => {
      const label = cols.value.find((c) => c.field === f.field)?.label ?? f.field;
      const desc =
        typeof f.min === 'number' || typeof f.max === 'number'
          ? `${label}：${typeof f.min === 'number' ? f.min : '−∞'} ~ ${typeof f.max === 'number' ? f.max : '+∞'}`
          : `${label}：${f.values.join(' / ')}`;
      out.push({ key: `f_${f.field}`, kind: 'filter', label: desc, remove: () => clearFilter(f.field) });
    });
    sorts.value.forEach((s, i) => {
      const label = cols.value.find((c) => c.field === s.field)?.label ?? s.field;
      out.push({
        key: `s_${s.field}`,
        kind: 'sort',
        label: `${label} ${s.order === 'asc' ? '升序' : '降序'}${sorts.value.length > 1 ? ` #${i + 1}` : ''}`,
        remove: () => clearSort(s.field),
      });
    });
    return out;
  });

  /** 某列所有出现过的值（文本/下拉列筛选项来源） */
  const distinctValues = (field: string, limit = 200): string[] => {
    const set = new Set<string>();
    const list = rows.value;
    for (let i = 0; i < list.length && set.size < limit; i += 1) {
      const v = list[i][field];
      if (!isBlank(v)) {
        set.add(String(v));
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  };

  return {
    searchText,
    filters,
    sorts,
    viewMode,
    page,
    pageSize,
    pageCount,
    processedRows,
    displayRows,
    clampPage,
    filterOf,
    setFilter,
    clearFilter,
    sortOf,
    cycleSort,
    clearSort,
    clearAllQuery,
    chips,
    distinctValues,
  };
};

export type BiQueryApi = ReturnType<typeof useBiQuery>;
