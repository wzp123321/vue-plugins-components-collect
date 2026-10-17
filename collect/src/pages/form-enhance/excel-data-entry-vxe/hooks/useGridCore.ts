// 录入台核心脊梁：列元信息 / 行数据 / 查询管道（搜索·筛选·排序·分页）/ 列统计 / 编辑事件
// 校验与历史已内聚为子 hook（useCellValidation / useHistory），本 hook 负责装配与共享状态。
import { ref, reactive, computed, watch } from 'vue';
import { RT } from '../components/cells/runtime';
import { useCellValidation } from './useCellValidation';
import { useHistory } from './useHistory';
import {
  type ColDef,
  type Row,
  type Snap,
  uid,
  DEPARTMENTS,
  STATUSES,
  SURNAMES,
  GIVEN,
  CITIES,
  emptyValueFor,
} from '../types';

export function useGridCore() {
  // ===================== 列元信息 =====================
  // 校验规则全部声明在列定义里（required / rules / cross），加列改列都不必改校验代码
  const columnDefs = ref<ColDef[]>([
    { field: 'name', label: '姓名', type: 'text', required: true, frozen: true, visible: true, width: 120, rules: { minLen: 2, maxLen: 12 } },
    { field: 'age', label: '年龄', type: 'number', required: true, visible: true, width: 90, rules: { min: 18, max: 65 } },
    { field: 'department', label: '部门', type: 'select', options: DEPARTMENTS, required: true, visible: true, width: 110 },
    { field: 'joinDate', label: '入职日期', type: 'date', required: true, visible: true, width: 130, cross: [{ kind: 'lte', other: 'leaveDate', msg: '入职日期不能晚于离职日期' }] },
    { field: 'leaveDate', label: '离职日期', type: 'date', required: false, visible: true, width: 130 },
    {
      field: 'email',
      label: '邮箱',
      type: 'text',
      required: false,
      visible: true,
      width: 200,
      rules: { unique: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', patternMsg: '邮箱格式不正确' },
    },
    { field: 'status', label: '状态', type: 'select', options: STATUSES, required: true, visible: true, width: 100 },
    { field: 'remark', label: '备注', type: 'text', required: false, visible: true, width: 160 },
  ]);
  const visibleDefs = computed(() => columnDefs.value.filter((d) => d.visible));
  const labelOf = (f: string) => columnDefs.value.find((d) => d.field === f)?.label ?? f;

  // ===================== 行数据 =====================
  /**
   * 按当前列结构造一行：init 覆盖指定字段，其余列按 emptyValueFor 留空（下拉不预选首项）。
   * 注意：init 里的 __id / __dirty 必须剥离——复制行（duplicateSelected）会整行传入，
   * 若被 init 覆盖就会产生两个相同 __id 的行（vxe 主键重复告警，且编辑/选区/校验会串行）
   */
  const makeRow = (init: Record<string, any> = {}): Row => {
    const { __id: _droppedId, __dirty: _droppedDirty, ...rest } = init;
    const row: Row = { __id: uid(), __dirty: false, ...rest };
    for (const d of columnDefs.value) {
      if (!(d.field in row)) row[d.field] = emptyValueFor(d);
    }
    return row;
  };

  // 真实感示例数据（数据中台：员工主数据）
  const genSampleRows = (n: number): Row[] => {
    const arr: Row[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const name = SURNAMES[i % SURNAMES.length] + GIVEN[(i * 3) % GIVEN.length];
      const age = 22 + (i % 40);
      const department = DEPARTMENTS[i % DEPARTMENTS.length];
      const year = 2018 + (i % 8);
      const month = 1 + (i % 12);
      const day = 1 + ((i * 5) % 27);
      const joinDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const email = `emp${String(i + 1).padStart(4, '0')}@corp.example.com`;
      const status = STATUSES[i % STATUSES.length];
      // 离职员工才有离职日期：给"入职≤离职"这条跨列规则提供真实数据面
      const leaveDate = status === '离职' ? `${year + 2}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
      const remark = CITIES[i % CITIES.length];
      arr[i] = makeRow({ name, age, department, joinDate, leaveDate, email, status, remark });
    }
    return arr;
  };

  // 预制示例数据（页面打开即载入）
  const allRows = ref<Row[]>(genSampleRows(200));

  // ===================== 校验（子 hook） =====================
  const validation = useCellValidation({
    getColumnDefs: () => columnDefs.value,
    getRows: () => allRows.value,
    labelOf,
    firstVisibleField: () => visibleDefs.value[0]?.field,
  });

  // ===================== 历史（子 hook） =====================
  const cloneRows = (rows: Row[]) => rows.map((r) => ({ ...r }));
  const cloneDefs = () => JSON.parse(JSON.stringify(columnDefs.value)) as ColDef[];
  /** 全量快照（行 + 列结构），供撤销栈 push；各 mutating 操作前统一调用 */
  const snapshotNow = (): Snap => ({ rows: cloneRows(allRows.value), defs: cloneDefs() });
  const dirtyCount = computed(() => allRows.value.reduce((n, r) => n + (r.__dirty ? 1 : 0), 0));

  const history = useHistory({
    snapshotNow,
    // 撤销/重做落地：恢复行与列结构后必须全量重校，否则错误标记与实际值不符
    applySnapshot: (snap) => {
      allRows.value = snap.rows.map((r) => ({ ...r }));
      columnDefs.value = snap.defs;
      validation.revalidateAll();
    },
  });

  // ===================== 搜索 / 筛选 / 排序 / 视图 =====================
  const searchText = ref('');
  const columnFilters = reactive<Record<string, string[]>>({});
  const sortList = ref<{ field: string; order: 'asc' | 'desc' }[]>([]);
  const viewMode = ref<'virtual' | 'paged'>('virtual');
  const pager = reactive({ currentPage: 1, pageSize: 100 });

  const searchFiltered = computed<Row[]>(() => {
    const kw = searchText.value.trim().toLowerCase();
    // 无关键词也必须返回新数组：原地增删行（push/splice）不改变 allRows 引用，
    // 若原样返回，pagedRows 引用不变 → vxe 的 :data prop 不触发更新 → 新行根本不渲染
    if (!kw) return allRows.value.slice();
    return allRows.value.filter((r) => visibleDefs.value.some((d) => String(r[d.field] ?? '').toLowerCase().includes(kw)));
  });

  const filteredRows = computed<Row[]>(() => {
    const keys = Object.keys(columnFilters).filter((k) => columnFilters[k]?.length);
    if (!keys.length) return searchFiltered.value;
    return searchFiltered.value.filter((r) => keys.every((k) => columnFilters[k].includes(String(r[k] ?? ''))));
  });

  const processedRows = computed<Row[]>(() => {
    const rows = filteredRows.value;
    if (!sortList.value.length) return rows;
    const sl = sortList.value;
    return [...rows].sort((a, b) => {
      for (const s of sl) {
        const av = a[s.field];
        const bv = b[s.field];
        let cmp = 0;
        if (av === bv) cmp = 0;
        else if (av === null || av === undefined || av === '') cmp = 1;
        else if (bv === null || bv === undefined || bv === '') cmp = -1;
        else if (!isNaN(Number(av)) && !isNaN(Number(bv))) cmp = Number(av) - Number(bv);
        else cmp = String(av).localeCompare(String(bv), 'zh-CN');
        if (cmp !== 0) return s.order === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  const pagedRows = computed<Row[]>(() => {
    if (viewMode.value === 'paged') {
      const start = (pager.currentPage - 1) * pager.pageSize;
      return processedRows.value.slice(start, start + pager.pageSize);
    }
    return processedRows.value;
  });

  watch(
    () => [processedRows.value.length, pager.pageSize, viewMode.value],
    () => {
      const maxPage = Math.max(1, Math.ceil(processedRows.value.length / pager.pageSize));
      if (pager.currentPage > maxPage) pager.currentPage = maxPage;
    },
    { immediate: true },
  );

  const onSortChange = (params: any) => {
    if (params?.sortList?.length) {
      sortList.value = params.sortList
        .map((s: any) => ({ field: s.field, order: s.order }))
        .filter((s: any) => s.order);
    } else {
      const field = params?.field ?? params?.property;
      const order = params?.order;
      if (!field) {
        sortList.value = [];
        return;
      }
      const list = sortList.value.slice();
      const i = list.findIndex((s) => s.field === field);
      if (!order) {
        sortList.value = list.filter((s) => s.field !== field);
        return;
      }
      if (i >= 0) list[i].order = order;
      else list.push({ field, order });
      sortList.value = list;
    }
  };

  const onFilterChange = (params: any) => {
    const col = params?.column;
    const field = col?.field ?? params?.field ?? params?.property;
    if (!field) return;
    let values: string[] = params?.values ?? col?.filteredValue ?? [];
    if ((!values || !values.length) && col?.filters) values = col.filters.filter((f: any) => f.checked).map((f: any) => f.value);
    columnFilters[field] = values ?? [];
  };

  // ===================== 当前单元格 =====================
  // 行选中（复选框）已移除；当前单元格是选区塌缩/编辑/填充手柄/状态栏统计的唯一基准
  const currentCell = ref<{ row: Row; field: string } | null>(null);
  const onCellClick = (params: any) => {
    if (params?.row && params?.column?.field) currentCell.value = { row: params.row, field: params.column.field };
  };

  // ===================== 单格闪烁高亮 =====================
  // 与 useGridMouse 填充手柄的 flashKeys（多格、填充场景）相互独立，避免互相打断；
  // 目前供校验面板跳转后标记目标格（cellClassName 会合并读取两处）
  const flashKeys = ref<Set<string>>(new Set());
  /** 单格闪烁：校验面板跳转后标记目标格（cellClassName 读取，ms 后自动清除） */
  const flashCell = (rowId: string, field: string, ms = 1200) => {
    flashKeys.value = new Set([validation.errKey(rowId, field)]);
    setTimeout(() => (flashKeys.value = new Set()), ms);
  };
  /** 多格闪烁：粘贴后高亮整个写入区域（与单格跳转闪烁共用一套 cellClassName 读取） */
  const flashCells = (keys: string[], ms = 900) => {
    if (!keys.length) return;
    flashKeys.value = new Set(keys);
    setTimeout(() => (flashKeys.value = new Set()), ms);
  };

  // ===================== 条件格式统计 =====================
  const conditionalOn = ref(false);
  const colStat = computed(() => {
    const stat: Record<string, { min: number; max: number }> = {};
    if (conditionalOn.value) {
      for (const d of columnDefs.value) {
        if (d.type !== 'number') continue;
        let min = Infinity,
          max = -Infinity;
        for (const r of processedRows.value) {
          const v = r[d.field];
          if (v !== null && v !== '' && !isNaN(Number(v))) {
            const n = Number(v);
            if (n < min) min = n;
            if (n > max) max = n;
          }
        }
        if (min <= max) stat[d.field] = { min, max };
      }
    }
    RT.colStat = stat;
    return stat;
  });
  watch(conditionalOn, (v) => {
    RT.conditionalOn = v;
  });
  // colStat 的结果只经 RT 桥被渲染器读取，需显式 touch 以保持随数据/列/开关更新
  watch([processedRows, conditionalOn, columnDefs], () => {
    colStat.value;
  }, { deep: true });

  // ===================== 列汇总（footer） =====================
  // 列顺序恒为 [seq, ...visibleDefs]（复选框列已移除），故汇总行可直接由 visibleDefs 推导，无需读取列配置
  const showFooter = ref(false);
  const footerData = computed<any[]>(() => {
    if (!showFooter.value) return [];
    const firstField = visibleDefs.value[0]?.field;
    const row: any[] = ['合计'];
    for (const d of visibleDefs.value) {
      if (d.type === 'number') {
        let sum = 0,
          cnt = 0;
        for (const r of processedRows.value) {
          const v = r[d.field];
          if (v !== null && v !== '' && !isNaN(Number(v))) {
            sum += Number(v);
            cnt++;
          }
        }
        row.push(cnt ? Number(sum.toFixed(2)) : '');
      } else if (d.field === firstField) {
        row.push(`共 ${processedRows.value.length} 行`);
      } else row.push('');
    }
    return [row];
  });

  // ===================== 状态栏聚合 =====================
  const activeColLabel = computed(() => (currentCell.value ? labelOf(currentCell.value.field) : ''));
  const activeStats = computed(() => {
    const f = currentCell.value?.field;
    if (!f) return null;
    const def = columnDefs.value.find((d) => d.field === f);
    if (def?.type !== 'number') return null;
    let sum = 0,
      min = Infinity,
      max = -Infinity,
      cnt = 0;
    for (const r of processedRows.value) {
      const v = r[f];
      if (v !== null && v !== '' && !isNaN(Number(v))) {
        const n = Number(v);
        sum += n;
        if (n < min) min = n;
        if (n > max) max = n;
        cnt++;
      }
    }
    return cnt ? { count: cnt, sum: Number(sum.toFixed(2)), avg: Number((sum / cnt).toFixed(2)), min, max } : null;
  });

  // 编辑开始记录旧值，结束时校验并把本次单元格改动接入撤销历史
  let editOld: any = undefined;
  let editRowId = '';
  let editField = '';
  const onEditActived = (params: any) => {
    editRowId = params?.row?.__id ?? '';
    editField = params?.column?.field ?? '';
    editOld = params?.row?.[editField];
  };
  const onEditClosed = (params: any) => {
    const row = params?.row;
    const field = params?.column?.field;
    if (row && field) {
      validation.validateCell(row, field);
      if (editRowId === row.__id && editField === field && editOld !== row[field]) {
        history.pushHistoryWithRevert(row.__id, field, editOld);
      }
    }
    editOld = undefined;
    editRowId = '';
    editField = '';
  };

  return {
    // 列元信息
    columnDefs,
    visibleDefs,
    labelOf,
    // 行数据
    allRows,
    makeRow,
    genSampleRows,
    dirtyCount,
    // 校验（子 hook 透出）
    ...validation,
    // 历史（子 hook 透出）
    snapshotNow,
    ...history,
    // 查询管道
    searchText,
    columnFilters,
    sortList,
    viewMode,
    pager,
    processedRows,
    pagedRows,
    onSortChange,
    onFilterChange,
    // 当前单元格 / 编辑事件
    currentCell,
    onCellClick,
    flashKeys,
    flashCell,
    flashCells,
    onEditActived,
    onEditClosed,
    // 统计 / footer
    conditionalOn,
    colStat,
    showFooter,
    footerData,
    activeColLabel,
    activeStats,
  };
}

export type GridCore = ReturnType<typeof useGridCore>;
