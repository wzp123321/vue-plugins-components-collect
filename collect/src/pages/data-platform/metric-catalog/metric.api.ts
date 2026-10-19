/**
 * 数据指标口径管理 —— 类型声明 + 请求层
 * ============================================================================
 * 本文件职责：
 *   1. 声明「指标口径管理」用到的全部类型（指标、维度、试算参数与结果）。
 *   2. 提供三个数据访问函数：fetchMetrics / fetchMetricDetail / queryMetric。
 *
 * 当前仓库是纯前端演示工程，没有后端，故三个函数内部走本地 mock（Promise + 延时模拟网络）。
 * ⚠️ 接入真实后端时，只需把函数体内注释标注的位置换成 axios 请求即可，调用方（hooks / 组件）无需改动。
 *    本仓库请求封装位于 src/services/request.ts（已注册 axios 拦截器），可直接 `import axios from 'axios'` 使用。
 * ============================================================================
 */

/** 指标类型：原子指标 / 派生指标 / 复合指标 */
export type MetricKind = 'atomic' | 'derived' | 'compound';

/** 指标上线状态 */
export type MetricStatus = 'online' | 'draft' | 'offline';

/** 指标可用维度 */
export interface MetricDimension {
  /** 维度英文标识，试算参数与结果列 key 使用它 */
  key: string;
  /** 维度中文名 */
  label: string;
}

/** 指标列表项（列表展示用的轻量结构） */
export interface MetricItem {
  id: string;
  /** 指标编码（全局唯一） */
  code: string;
  /** 指标名称 */
  name: string;
  /** 主题域（所属业务分类） */
  domain: string;
  kind: MetricKind;
  status: MetricStatus;
  /** 计量单位 */
  unit: string;
  /** 小数精度（展示位数） */
  precision: number;
  /** 责任人 */
  owner: string;
  /** 口径版本号 */
  version: string;
  /** 最近更新时间 */
  updateTime: string;
}

/** 指标详情（在列表项基础上补充口径信息） */
export interface MetricDetail extends MetricItem {
  /** 业务定义 */
  definition: string;
  /** 计算口径表达式 */
  expr: string;
  /** 来源物理表 */
  sourceTable: string;
  /** 来源字段 */
  sourceField: string;
  /** 可用维度 */
  dimensions: MetricDimension[];
  /** 标签 */
  tags: string[];
  /** 口径说明 */
  description: string;
  /** 演示用基准值（仅本地 mock 试算时用于生成结果，真实后端无此字段） */
  sampleValue: number;
}

/** 试算查询参数 */
export interface MetricQueryParams {
  metricId: string;
  /** 勾选的维度 key 列表 */
  dimensions: string[];
  /** 统计区间（可选） */
  dateRange: [string, string] | null;
}

/** 试算结果列 */
export interface MetricResultColumn {
  key: string;
  label: string;
}

/** 试算结果 */
export interface MetricQueryResult {
  columns: MetricResultColumn[];
  rows: Record<string, string | number>[];
  /** 耗时（毫秒，演示用） */
  elapsedMs: number;
}

/** 类型 / 状态的中文文案，多处展示复用 */
export const metricKindLabel: Record<MetricKind, string> = {
  atomic: '原子指标',
  derived: '派生指标',
  compound: '复合指标',
};

export const metricStatusLabel: Record<MetricStatus, string> = {
  online: '已上线',
  draft: '草稿',
  offline: '已下线',
};

export const metricStatusTagType: Record<MetricStatus, 'success' | 'info' | 'warning'> = {
  online: 'success',
  draft: 'warning',
  offline: 'info',
};

/** 维度字典：维度的中文名与取值集合（mock 试算按此生成结果行） */
export const METRIC_DIMENSIONS: MetricDimension[] = [
  { key: 'date', label: '统计月份' },
  { key: 'region', label: '园区' },
  { key: 'transformer', label: '台区' },
  { key: 'energyType', label: '用电类型' },
  { key: 'customerType', label: '客户类型' },
  { key: 'voltage', label: '电压等级' },
];

const DIMENSION_MEMBERS: Record<string, string[]> = {
  date: ['2026-08', '2026-09', '2026-10'],
  region: ['总部园区', '上海园区', '深圳园区', '成都基地'],
  transformer: ['1#配变', '2#配变', '3#配变'],
  energyType: ['照明用电', '动力用电', '空调用电'],
  customerType: ['商业', '办公', '工业'],
  voltage: ['220V', '380V', '10kV'],
};

const dimensionLabel = (key: string): string => METRIC_DIMENSIONS.find((d) => d.key === key)?.label ?? key;

/** mock 指标明细数据（演示用，含口径与维度） */
const mockMetricDetails: MetricDetail[] = [
  {
    id: 'm-1',
    code: 'MTR_ENERGY_DAILY',
    name: '日售电量',
    domain: '电量电费',
    kind: 'atomic',
    status: 'online',
    unit: 'kWh',
    precision: 2,
    owner: '张伟',
    version: 'v1.3.0',
    updateTime: '2026-10-12 09:20',
    definition: '统计口径下所有计量点在统计周期内的正向有功总电量之和。',
    expr: 'SUM(dwd_meter_read_d.daily_forward_kwh)',
    sourceTable: 'dwd_meter_read_d',
    sourceField: 'daily_forward_kwh',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
      { key: 'transformer', label: '台区' },
      { key: 'energyType', label: '用电类型' },
    ],
    tags: ['电量', '核心', '日更'],
    description: '按自然日汇聚计量点正向有功总电量；跨月统计时按月汇总后再相加，避免区间重叠重复计数。',
    sampleValue: 128000,
  },
  {
    id: 'm-2',
    code: 'MTR_ENERGY_TOTAL',
    name: '累计售电量',
    domain: '电量电费',
    kind: 'derived',
    status: 'online',
    unit: 'kWh',
    precision: 2,
    owner: '张伟',
    version: 'v1.1.2',
    updateTime: '2026-10-10 15:40',
    definition: '统计区间内日售电量按维度累计求和。',
    expr: 'SUM([MTR_ENERGY_DAILY]) OVER(统计区间)',
    sourceTable: 'dws_meter_read_m',
    sourceField: 'sold_kwh',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
    ],
    tags: ['电量', '派生'],
    description: '派生自「日售电量」，继承其过滤条件与维度；区间起止由试算面板选择。',
    sampleValue: 3800000,
  },
  {
    id: 'm-3',
    code: 'MTR_LINE_LOSS_RATE',
    name: '台区线损率',
    domain: '线损分析',
    kind: 'compound',
    status: 'online',
    unit: '%',
    precision: 2,
    owner: '李娜',
    version: 'v2.0.1',
    updateTime: '2026-10-15 11:05',
    definition: '台区供电量与售电量之差占供电量的比重，反映配电网损耗水平。',
    expr: '(供电量 - 售电量) / 供电量 * 100',
    sourceTable: 'dws_transformer_energy_m',
    sourceField: 'supply_kwh, sold_kwh',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
      { key: 'transformer', label: '台区' },
    ],
    tags: ['线损', '复合'],
    description: '供电量为台区关口表电量，售电量为台区下所有计量点电量；供电量为 0 时结果置空而非报错。',
    sampleValue: 4.2,
  },
  {
    id: 'm-4',
    code: 'MTR_AVG_LOAD',
    name: '平均负荷',
    domain: '负荷分析',
    kind: 'compound',
    status: 'draft',
    unit: 'kW',
    precision: 2,
    owner: '王强',
    version: 'v0.9.0',
    updateTime: '2026-10-16 17:30',
    definition: '统计区间内平均每小时的有功功率。',
    expr: '售电量 / (统计天数 * 24)',
    sourceTable: 'dws_meter_read_m',
    sourceField: 'sold_kwh',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
      { key: 'transformer', label: '台区' },
    ],
    tags: ['负荷', '草稿'],
    description: '口径待评审：是否剔除停电日、是否按实际运行小时数折算，尚需业务确认。',
    sampleValue: 5300,
  },
  {
    id: 'm-5',
    code: 'MTR_ENERGY_PER_HOUSEHOLD',
    name: '户均用电量',
    domain: '客户分析',
    kind: 'derived',
    status: 'online',
    unit: 'kWh/户',
    precision: 1,
    owner: '李娜',
    version: 'v1.0.0',
    updateTime: '2026-10-09 10:10',
    definition: '统计区间内售电量与有效用户户数之比。',
    expr: 'SUM(售电量) / COUNT(DISTINCT 用户编号)',
    sourceTable: 'dws_customer_energy_m',
    sourceField: 'sold_kwh, customer_id',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
      { key: 'customerType', label: '客户类型' },
    ],
    tags: ['客户', '派生'],
    description: '有效用户指区间内存在抄表记录的用户；销户用户不计入分母。',
    sampleValue: 420,
  },
  {
    id: 'm-6',
    code: 'MTR_FEE_RECOVERY_RATE',
    name: '电费回收率',
    domain: '电费管理',
    kind: 'compound',
    status: 'offline',
    unit: '%',
    precision: 2,
    owner: '周敏',
    version: 'v1.4.5',
    updateTime: '2026-09-28 08:45',
    definition: '实收电费占应收电费的比重，反映电费回收情况。',
    expr: '实收电费 / 应收电费 * 100',
    sourceTable: 'dws_fee_settle_m',
    sourceField: 'paid_amount, receivable_amount',
    dimensions: [
      { key: 'date', label: '统计月份' },
      { key: 'region', label: '园区' },
      { key: 'customerType', label: '客户类型' },
      { key: 'voltage', label: '电压等级' },
    ],
    tags: ['电费', '复合'],
    description: '因结算规则调整已下线，新口径见 v2 版本；此处保留用于历史数据回溯。',
    sampleValue: 97.5,
  },
];

/** mock 延时，模拟网络请求耗时 */
const delay = (ms = 300): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** 稳定散列：保证同一维度组合每次试算得到相同的演示数值 */
const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 100000;
  }
  return h;
};

/** 四舍五入到指定小数位 */
const roundTo = (value: number, precision: number): number => Number(value.toFixed(precision));

/** 笛卡尔积：由勾选维度生成维度取值组合 */
const cartesian = (groups: string[][]): string[][] =>
  groups.reduce<string[][]>((acc, group) => acc.flatMap((row) => group.map((v) => [...row, v])), [[]]);

/**
 * 查询指标列表
 */
export async function fetchMetrics(): Promise<MetricItem[]> {
  // TODO 接入真实后端：const { data } = await axios.get('/api/metric/list'); return data.data;
  await delay(300);
  return mockMetricDetails.map((m) => ({ ...m }));
}

/**
 * 查询指标详情
 */
export async function fetchMetricDetail(id: string): Promise<MetricDetail | null> {
  // TODO 接入真实后端：const { data } = await axios.get(`/api/metric/${id}`); return data.data;
  await delay(200);
  const detail = mockMetricDetails.find((m) => m.id === id);
  return detail ? { ...detail } : null;
}

/**
 * 指标试算：按勾选维度对指标做聚合查询
 * 未勾选任何维度时返回单行「全量汇总」结果。
 */
export async function queryMetric(params: MetricQueryParams): Promise<MetricQueryResult> {
  // TODO 接入真实后端：const { data } = await axios.post('/api/metric/query', params); return data.data;
  const start = Date.now();
  await delay(400);

  const detail = mockMetricDetails.find((m) => m.id === params.metricId);
  if (!detail) {
    return { columns: [], rows: [], elapsedMs: 0 };
  }

  const keys = params.dimensions.filter((k) => detail.dimensions.some((d) => d.key === k));
  const columns: MetricResultColumn[] = keys.map((k) => ({ key: k, label: dimensionLabel(k) }));
  columns.push({ key: 'value', label: `${detail.name}（${detail.unit}）` });

  // 维度取值组合：未勾选维度时给一组空组合，得到单行全量汇总
  const combos = keys.length ? cartesian(keys.map((k) => DIMENSION_MEMBERS[k] ?? [])) : [[]];

  const rows: Record<string, string | number>[] = combos.map((combo) => {
    const row: Record<string, string | number> = {};
    keys.forEach((k, i) => {
      row[k] = combo[i];
    });
    const seed = hashString(`${detail.id}|${combo.join('/')}|${params.dateRange?.join('~') ?? ''}`);
    row.value = roundTo(detail.sampleValue * (0.6 + (seed % 80) / 100), detail.precision);
    return row;
  });

  return { columns, rows, elapsedMs: Date.now() - start };
}
