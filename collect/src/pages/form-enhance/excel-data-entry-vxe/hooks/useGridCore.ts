// 录入台核心脊梁：列元信息 / 行数据 / 查询管道（搜索·筛选·排序·分页）/ 列统计 / 编辑事件
// 校验与历史已内聚为子 hook（useCellValidation / useHistory），本 hook 负责装配与共享状态。
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import { RT } from '../components/cells/runtime';
import { useCellValidation } from './useCellValidation';
import { useHistory } from './useHistory';
import type { CellChange } from './useHistory';
import { aggregateByField, aggregateColumn, type NumAgg } from './aggregate';
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

/**
 * 行主键 / 脏标记 / 惰性求值触碰助手。
 * ⚠️ __id / __dirty 是 vxe-table 消费的行字段（__id 即页面 :row-config 的 keyField），
 * 属性名属外部约定、不可重命名；统一经解构读取（rowIdOf / dirtyOf），键名与语义不变，
 * 同时避免 no-underscore-dangle 报错。touch 用于显式建立 computed 依赖 / 触发其副作用。
 */
export const rowIdOf = (r?: { __id: string } | null): string => {
  if (!r) return '';
  const { __id } = r;
  return __id ?? '';
};
export const dirtyOf = (r: { __dirty: boolean }): boolean => {
  const { __dirty } = r;
  return __dirty;
};
const touch = <T>(source: { value: T }): T => source.value;

/** 搜索输入防抖（ms）：大表下每个按键全表扫描会卡输入，停手后再算 */
const SEARCH_DEBOUNCE_MS = 200;

/**
 * 单列筛选条件匹配（供 filteredRows 消费）。支持三种写法：
 *   - 比较：`>=30`、`<=2024-12-31`、`>0`、`<0`、`!=xx`（数字按数值比，其余按字符串比；空值不参与比较）；
 *   - 区间：`2024-01..2024-06`（闭区间）；
 *   - 普通值：数字列精确匹配，下拉列精确匹配，文本/日期列按"包含"匹配（不区分大小写）。
 * @param def  该列定义（决定普通值的匹配语义）
 * @param raw  单元格原始值
 * @param expr 筛选表达式（来自列筛选面板 / 查询 chips）
 */
const matchFilter = (def: ColDef | undefined, raw: any, expr: string): boolean => {
  const e = String(expr ?? '').trim();
  if (!e) return true;
  const s = String(raw ?? '');
  const cmp = (x: string, y: string) => {
    const nx = Number(x);
    const ny = Number(y);
    const numeric = x.trim() !== '' && y.trim() !== '' && !Number.isNaN(nx) && !Number.isNaN(ny);
    return numeric ? nx - ny : x.localeCompare(y, 'zh-CN');
  };
  if (e.startsWith('>=')) return s !== '' && cmp(s, e.slice(2)) >= 0;
  if (e.startsWith('<=')) return s !== '' && cmp(s, e.slice(2)) <= 0;
  if (e.startsWith('!=')) return s !== e.slice(2).trim();
  if (e.startsWith('>')) return s !== '' && cmp(s, e.slice(1)) > 0;
  if (e.startsWith('<')) return s !== '' && cmp(s, e.slice(1)) < 0;
  const range = e.match(/^(.+?)\.\.(.+)$/);
  if (range) return s !== '' && cmp(s, range[1].trim()) >= 0 && cmp(s, range[2].trim()) <= 0;
  if (def?.type === 'number') return s !== '' && Number(s) === Number(e);
  if (def?.type === 'select') return s === e;
  return s.toLowerCase().includes(e.toLowerCase());
};

/**
 * 录入台中枢状态容器：装配并共享整个 Excel 式录入台所需的全部核心状态与管道。
 *
 * 在整体架构中的角色：所有其它 hook（useGridKeys / useCellSelection / useGridOps /
 * useGridMouse / useGridIO / useGridFindReplace / useGridColumns 等）都依赖本 hook
 * 提供的 `core` 实例；它不感知 DOM 与事件，只负责：
 *   1. 列元信息（columnDefs / visibleDefs）—— 校验规则、列宽、可见性都声明在此；
 *   2. 行数据（allRows）+ 查询管道（搜索 / 筛选 / 排序 / 分页 → processedRows / pagedRows）；
 *   3. 当前单元格（currentCell）—— 选区塌缩 / 编辑 / 填充手柄 / 状态栏统计的唯一基准；
 *   4. 列汇总 / 条件格式 / 状态栏聚合等派生统计；
 *   5. 装配两个子 hook（useCellValidation 校验、useHistory 历史）并共享它们的能力。
 *
 * 协作约定：数据写入一律走 makeRow 造行；任何会改数据的 mutating 操作前先
 * `core.pushSnapshot(core.snapshotNow())` 入撤销栈；行/列结构变更后必须 `revalidateAll()`。
 *
 * @returns 一个聚合了列 / 行 / 查询 / 统计 / 校验 / 历史等能力的对象，类型见 {@link GridCore}
 */
export const useGridCore = () => {
  /**
   * 数据版本号：任何"行值 / 行集合"变化后自增。
   * ⚠️ 为什么需要：行值是原地改的（编辑、填充、粘贴都不换行对象、也不换 allRows 引用），
   * computed 无法靠引用变化感知，故用版本号显式触发统计/色阶重算，同时让统计缓存能安全失效。
   */
  const dataRev = ref(0);
  const bumpData = () => {
    dataRev.value++;
  };

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
    // ⚠️ 坑：构造行必须剥离 init 里的 __id/__dirty——{ __id: uid(), ...init } 遇 makeRow({...row})
    // （复制行）会被原主键覆盖 → 两行同 id → vxe 报主键重复，编辑/选区/校验全串行
    // （rest 解构会留下两个无引用绑定，改为显式重建 rest，语义不变）
    const rest: Record<string, any> = {};
    Object.keys(init).forEach((k) => {
      if (k !== '__id' && k !== '__dirty') rest[k] = init[k];
    });
    const row: Row = { __id: uid(), __dirty: false, ...rest };
    columnDefs.value.forEach((d) => {
      if (!(d.field in row)) row[d.field] = emptyValueFor(d);
    });
    return row;
  };

  /**
   * 生成 n 行真实感示例数据（员工主数据）：姓名按姓氏表+名表拼接、年龄/部门/日期按索引错开，
   * 离职员工才填离职日期以便为"入职≤离职"的跨列规则提供真实数据面。
   * 注意：每行都经 makeRow 造行——自动剥离 init 里的 __id/__dirty，避免复制行主键冲突。
   * @param n 目标行数
   * @returns 新建的 Row 数组（不含任何 dirty 之外的状态污染）
   */
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
  const dirtyCount = computed(() => allRows.value.reduce((n, r) => n + (dirtyOf(r) ? 1 : 0), 0));

  const history = useHistory({
    snapshotNow,
    // 撤销/重做落地：恢复行与列结构后必须全量重校，否则错误标记与实际值不符
    applySnapshot: (snap) => {
      allRows.value = snap.rows.map((r) => ({ ...r }));
      columnDefs.value = snap.defs;
      validation.revalidateAll();
      bumpData();
    },
    // 增量命令按 rowId 定位行、应用后重校
    getRows: () => allRows.value,
    revalidateAll: () => validation.revalidateAll(),
    bumpData: () => bumpData(),
  });

  /**
   * 单元格增量事务：执行 fn 前对"受影响行"做浅拷贝，执行后按字段 diff，生成字段级撤销记录。
   *
   * 适用：只改已有行若干字段的操作（编辑 / 各类填充 / 批量填充 / 替换 / 清空内容）。
   * 不适用：增删行、加删列、整表替换——那些走 pushSnapshot 全量快照（见各调用点）。
   *
   * 相比"每步拷贝整表"的快照，代价降到 O(受影响行数 × 字段数)，10 万行下编辑一格不再复制十万行。
   * @param label 操作名（撤销提示用）
   * @param rows  本次操作可能修改到的行（宁可多传，diff 会过滤掉没变的字段）
   * @param fn    实际写数据的函数（同步执行）
   */
  const commitCells = (label: string, rows: Row[], fn: () => void) => {
    const before = rows.map((r) => ({ row: r, snap: { ...r } }));
    fn();
    const changes: CellChange[] = [];
    before.forEach(({ row, snap }) => {
      // 取并集：fn 里可能给行补了新字段（如粘贴新增列后回填空串）
      const keys = new Set([...Object.keys(snap), ...Object.keys(row)]);
      keys.forEach((k) => {
        // 主键不参与 diff（原 continue 的反条件写法）
        if (k !== '__id' && row[k] !== snap[k]) {
          changes.push({ rowId: rowIdOf(row), field: k, before: snap[k], after: row[k] });
        }
      });
    });
    if (changes.length) {
      history.pushCells(label, changes);
      bumpData();
    }
  };

  // ===================== 搜索 / 筛选 / 排序 / 视图 =====================
  /** 工具栏搜索框的输入值（即时回显，绑 v-model） */
  const searchText = ref('');
  /**
   * 实际参与过滤的搜索词：输入后防抖 200ms 再同步。
   * ⚠️ 性能要点：大表下每个按键都全表扫描（行 × 可见列）会明显卡输入，防抖后只在停手时算一次；
   * 清空是同步生效的（点 clearable 不该等 200ms）。
   */
  const searchTerm = ref('');
  let searchTimer: number | null = null;
  watch(searchText, (v) => {
    if (searchTimer) {
      window.clearTimeout(searchTimer);
      searchTimer = null;
    }
    if (!v.trim()) {
      searchTerm.value = '';
      return;
    }
    searchTimer = window.setTimeout(() => {
      searchTerm.value = v;
      searchTimer = null;
    }, SEARCH_DEBOUNCE_MS);
  });
  onBeforeUnmount(() => {
    if (searchTimer) window.clearTimeout(searchTimer);
  });
  const columnFilters = reactive<Record<string, string[]>>({});
  // 筛选面板（vxe 弹层里）拿不到 core，经 runtime 桥读取当前筛选值做回显
  RT.filters = columnFilters;
  const sortList = ref<{ field: string; order: 'asc' | 'desc' }[]>([]);
  const viewMode = ref<'virtual' | 'paged'>('virtual');
  const pager = reactive({ currentPage: 1, pageSize: 100 });

  const searchFiltered = computed<Row[]>(() => {
    const kw = searchTerm.value.trim().toLowerCase();
    // ⚠️ 坑：无关键词也必须返回新数组：原地增删行（push/splice）不改变 allRows 引用，
    // 若原样返回，pagedRows 引用不变 → vxe 的 :data prop 不触发更新 → 新行根本不渲染
    if (!kw) return allRows.value.slice();
    // 预取字段名一次：省掉重复的 visibleDefs 读取（some 命中即短路退出）
    const fields = visibleDefs.value.map((d) => d.field);
    return allRows.value.filter((r) => fields.some((f) => String(r[f] ?? '').toLowerCase().includes(kw)));
  });

  const filteredRows = computed<Row[]>(() => {
    const keys = Object.keys(columnFilters).filter((k) => columnFilters[k]?.length);
    if (!keys.length) return searchFiltered.value;
    // 列定义建一次索引：逐行逐条件 find 会在万行表上放大成 O(rows × keys × defs)
    const defMap = new Map(columnDefs.value.map((d) => [d.field, d]));
    return searchFiltered.value.filter((r) =>
      keys.every((k) => {
        const def = defMap.get(k);
        // 列已被删除但筛选状态残留时忽略该条件，避免"数据莫名消失"
        if (!def) return true;
        return columnFilters[k].some((v) => matchFilter(def, r[k], v));
      }),
    );
  });

  const processedRows = computed<Row[]>(() => {
    const rows = filteredRows.value;
    if (!sortList.value.length) return rows;
    const sl = sortList.value;
    return [...rows].sort((a, b) => {
      for (let i = 0; i < sl.length; i++) {
        const s = sl[i];
        const av = a[s.field];
        const bv = b[s.field];
        let cmp = 0;
        if (av === bv) cmp = 0;
        else if (av === null || av === undefined || av === '') cmp = 1;
        else if (bv === null || bv === undefined || bv === '') cmp = -1;
        else if (!Number.isNaN(Number(av)) && !Number.isNaN(Number(bv))) cmp = Number(av) - Number(bv);
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

  /**
   * 统一适配 vxe 的多种排序事件源：既处理 sort-config 的批量 sortList，也兼容单字段点击排序。
   * 内部维护一个 `sortList`（多列排序顺序数组），供 processedRows 排序时消费。
   * @param params vxe 排序事件参数（可能是 {sortList} 批量，也可能是 {field/property, order} 单字段）
   */
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

  /**
   * 统一适配 vxe 的筛选事件：从事件参数里尽可能多地解析出 (field, values) 组合
   * （兼容 column.field / params.field / property 以及 column.filteredValue / filters 勾选项）。
   * 结果写入 reactive 的 columnFilters，供 filteredRows 消费。
   * @param params vxe 筛选事件参数
   */
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
  /** 单元格点击：把点击到的 (row, field) 记为当前单元格——它是选区塌缩 / 编辑 / 填充手柄 / 状态栏统计的唯一基准 */
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
    setTimeout(() => {
      flashKeys.value = new Set();
    }, ms);
  };
  /** 多格闪烁：粘贴后高亮整个写入区域（与单格跳转闪烁共用一套 cellClassName 读取） */
  const flashCells = (keys: string[], ms = 900) => {
    if (!keys.length) return;
    flashKeys.value = new Set(keys);
    setTimeout(() => {
      flashKeys.value = new Set();
    }, ms);
  };

  // ===================== 条件格式统计 =====================
  const conditionalOn = ref(false);
  /**
   * 条件格式统计：仅在 conditionalOn 开启时为各数值列算出 min/max，结果经 RT 桥（runtime）被渲染器读取做色阶。
   * 依赖 dataRev：行值是原地改的，没有版本号时编辑后色阶不会重算。
   */
  const colStat = computed(() => {
    touch(dataRev); // 显式依赖数据版本
    const stat: Record<string, { min: number; max: number }> = {};
    if (conditionalOn.value) {
      const fields = columnDefs.value.filter((d) => d.type === 'number').map((d) => d.field);
      const agg = aggregateByField(processedRows.value, fields);
      fields.forEach((f) => {
        const a = agg[f];
        if (a) stat[f] = { min: a.min, max: a.max };
      });
    }
    RT.colStat = stat;
    return stat;
  });
  watch(conditionalOn, (v) => {
    RT.conditionalOn = v;
    // 主动求值一次，把 RT.colStat 写出去（computed 是惰性的，没人读就不会更新桥）
    if (v) touch(colStat);
  });
  // 数据变化时刷新色阶统计（只在开启时才算，避免无谓的全表扫描）
  watch(dataRev, () => {
    if (conditionalOn.value) touch(colStat);
  });

  // ===================== 列汇总（footer） =====================
  // 列顺序恒为 [seq, ...visibleDefs]（复选框列已移除），故汇总行可直接由 visibleDefs 推导，无需读取列配置
  const showFooter = ref(false);
  /** 列汇总（footer）：数值列求和（保留 2 位）、首列显示总行数；列顺序恒为 [合计, ...visibleDefs]，无需读列配置 */
  const footerData = computed<any[]>(() => {
    if (!showFooter.value) return [];
    touch(dataRev);
    const rows = processedRows.value;
    // 一次扫描算完所有数值列（原来每列各扫一遍全表）
    const fields = visibleDefs.value.filter((d) => d.type === 'number').map((d) => d.field);
    const agg = aggregateByField(rows, fields);
    const firstField = visibleDefs.value[0]?.field;
    const row: any[] = ['合计'];
    visibleDefs.value.forEach((d) => {
      if (d.type === 'number') row.push(agg[d.field] ? agg[d.field].sum : '');
      else if (d.field === firstField) row.push(`共 ${rows.length} 行`);
      else row.push('');
    });
    return [row];
  });

  // ===================== 状态栏聚合 =====================
  const activeColLabel = computed(() => (currentCell.value ? labelOf(currentCell.value.field) : ''));
  /**
   * 当前列统计缓存：键 = 字段 + 结果集引用 + 数据版本。
   * 移动当前格（上/下/左/右）时通常命中缓存，5 万行表不再每按一次方向键就全表扫一遍。
   */
  let statCache: { field: string; rows: Row[]; rev: number; value: NumAgg | null } | null = null;
  /**
   * 状态栏统计·当前列全量轨（activeStats）：以 currentCell 所在数值列为基准，
   * 对当前查询结果的所有行做 count/sum/avg/min/max。
   * 与 useGridOps 的 selectionStats（选区内数字格聚合）构成"双轨"统计。
   */
  const activeStats = computed(() => {
    const f = currentCell.value?.field;
    if (!f) return null;
    const def = columnDefs.value.find((d) => d.field === f);
    if (def?.type !== 'number') return null;
    const rows = processedRows.value;
    const rev = dataRev.value;
    if (statCache && statCache.field === f && statCache.rows === rows && statCache.rev === rev) {
      return statCache.value;
    }
    const value = aggregateColumn(rows, f);
    statCache = { field: f, rows, rev, value };
    return value;
  });

  // 编辑开始记录旧值，结束时校验并把本次单元格改动接入撤销历史
  let editOld: any;
  let editRowId = '';
  let editField = '';
  /** 编辑开始：记录被编辑格的 rowId/field/旧值，供 onEditClosed 比对并接入撤销历史 */
  const onEditActived = (params: any) => {
    editRowId = rowIdOf(params?.row);
    editField = params?.column?.field ?? '';
    editOld = params?.row?.[editField];
  };
  /** 编辑结束：立即校验该格；若值与编辑前不同，则以字段级增量记入撤销栈（不再拷贝整表） */
  const onEditClosed = (params: any) => {
    const row = params?.row;
    const field = params?.column?.field;
    if (row && field) {
      validation.validateCell(row, field);
      if (editRowId === rowIdOf(row) && editField === field && editOld !== row[field]) {
        history.pushCells('编辑单元格', [{ rowId: rowIdOf(row), field, before: editOld, after: row[field] }]);
        // ⚠️ 编辑是直接 pushCells（不经 commitCells），必须自己 bump，否则统计缓存会命中旧值
        bumpData();
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
    // 数据版本（统计缓存失效 / 色阶重算）
    dataRev,
    bumpData,
    // 校验（子 hook 透出）
    ...validation,
    // 历史（子 hook 透出）
    snapshotNow,
    ...history,
    // 字段级增量事务（高频写数据入口统一走它）
    commitCells,
    // 查询管道
    searchText,
    searchTerm,
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

/**
 * useGridCore 的返回类型别名：所有依赖"核心状态"的 hook 都通过 {@link GridCore}
 * 类型拿到统一的 core 实例签名（列 / 行 / 查询 / 统计 / 校验 / 历史 等字段）。
 */
export type GridCore = ReturnType<typeof useGridCore>;
