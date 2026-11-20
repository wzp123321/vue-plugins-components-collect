/**
 * 报表展示 —— 演示数据
 * ============================================================================
 * 口径与 data-platform/metric-catalog 保持一致的电力场景：
 *   园区 × 台区 × 用电类型 × 月份 → 售电量(kWh) 与同比。
 *
 * 数据用固定种子生成（不随刷新变化），并预先算好各报表要用的聚合结果，
 * 组件只做渲染，不在模板里跑计算逻辑。
 */

export const MONTHS = ['2026-08', '2026-09', '2026-10'];
export const PARKS = ['总部园区', '上海园区', '深圳园区', '成都基地'];
export const TRANSFORMERS = ['1#配变', '2#配变', '3#配变'];
export const ENERGY_TYPES = ['照明用电', '动力用电', '空调用电'];

export interface ReportRow {
  month: string;
  park: string;
  transformer: string;
  energyType: string;
  kwh: number;
  /** 同比，单位 % */
  yoy: number;
}

/** 固定种子伪随机，保证每次进入页面数值一致 */
const noise = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const PARK_BASE: Record<string, number> = {
  总部园区: 168000,
  上海园区: 142000,
  深圳园区: 121000,
  成都基地: 96000,
};
const MONTH_FACTOR: Record<string, number> = { '2026-08': 1.08, '2026-09': 0.96, '2026-10': 1.0 };
const ENERGY_FACTOR: Record<string, number> = { 照明用电: 0.24, 动力用电: 0.48, 空调用电: 0.28 };
const TRANSFORMER_FACTOR: Record<string, number> = { '1#配变': 0.42, '2#配变': 0.35, '3#配变': 0.23 };

const buildRows = (): ReportRow[] => {
  const rows: ReportRow[] = [];
  let seed = 0;
  PARKS.forEach((park) => {
    TRANSFORMERS.forEach((transformer) => {
      ENERGY_TYPES.forEach((energyType) => {
        MONTHS.forEach((month) => {
          seed += 1;
          const base =
            PARK_BASE[park] *
            MONTH_FACTOR[month] *
            ENERGY_FACTOR[energyType] *
            TRANSFORMER_FACTOR[transformer];
          const kwh = Math.round((base * (0.88 + noise(seed) * 0.24)) / 100) * 100;
          const yoy = Math.round((noise(seed * 3.7) * 22 - 5) * 10) / 10;
          rows.push({ month, park, transformer, energyType, kwh, yoy });
        });
      });
    });
  });
  return rows;
};

export const REPORT_ROWS: ReportRow[] = buildRows();

export const sumKwh = (rows: ReportRow[]): number => rows.reduce((acc, row) => acc + row.kwh, 0);

export const fmtKwh = (value: number): string => value.toLocaleString('zh-CN');

export const fmtWan = (value: number): string => `${(value / 10000).toFixed(1)} 万`;

export const fmtPct = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

/** 按任取条件过滤原始行 */
export const pickRows = (predicate: (row: ReportRow) => boolean): ReportRow[] => REPORT_ROWS.filter(predicate);

// ───────────────────────── 交叉表 ─────────────────────────
export interface CrossTableData {
  columns: string[];
  rows: { park: string; values: number[]; total: number }[];
  columnTotals: number[];
  total: number;
  max: number;
}

export const CROSS_TABLE: CrossTableData = (() => {
  const rows = PARKS.map((park) => {
    const values = MONTHS.map((month) => sumKwh(pickRows((r) => r.park === park && r.month === month)));
    return { park, values, total: values.reduce((a, b) => a + b, 0) };
  });
  const columnTotals = MONTHS.map((month) => sumKwh(pickRows((r) => r.month === month)));
  const flat = rows.flatMap((r) => r.values);
  return {
    columns: MONTHS,
    rows,
    columnTotals,
    total: columnTotals.reduce((a, b) => a + b, 0),
    max: Math.max(...flat),
  };
})();

// ───────────────────────── 分组表 ─────────────────────────
export interface GroupRow {
  park: string;
  transformer: string;
  kwh: number;
  /** 占全量比 */
  share: number;
  /** 环比（末月对中月） */
  mom: number;
}

export interface GroupBlock {
  park: string;
  total: number;
  share: number;
  mom: number;
  children: GroupRow[];
}

export const GROUP_TABLE: GroupBlock[] = (() => {
  const grandTotal = sumKwh(REPORT_ROWS);
  return PARKS.map((park) => {
    const parkRows = pickRows((r) => r.park === park);
    const total = sumKwh(parkRows);
    const last = sumKwh(parkRows.filter((r) => r.month === '2026-10'));
    const prev = sumKwh(parkRows.filter((r) => r.month === '2026-09'));
    const children = TRANSFORMERS.map((transformer) => {
      const kwh = sumKwh(parkRows.filter((r) => r.transformer === transformer));
      const tLast = sumKwh(parkRows.filter((r) => r.transformer === transformer && r.month === '2026-10'));
      const tPrev = sumKwh(parkRows.filter((r) => r.transformer === transformer && r.month === '2026-09'));
      return {
        park,
        transformer,
        kwh,
        share: total ? (kwh / total) * 100 : 0,
        mom: tPrev ? ((tLast - tPrev) / tPrev) * 100 : 0,
      };
    });
    return {
      park,
      total,
      share: grandTotal ? (total / grandTotal) * 100 : 0,
      mom: prev ? ((last - prev) / prev) * 100 : 0,
      children,
    };
  });
})();

// ───────────────────────── 明细表 ─────────────────────────
export interface DetailRow {
  month: string;
  park: string;
  transformer: string;
  energyType: string;
  kwh: number;
  yoy: number;
}

export const DETAIL_ROWS: DetailRow[] = REPORT_ROWS.map((r) => ({
  month: r.month,
  park: r.park,
  transformer: r.transformer,
  energyType: r.energyType,
  kwh: r.kwh,
  yoy: r.yoy,
}));

// ───────────────────────── 复杂表头 ─────────────────────────
export interface ComplexCell {
  month: string;
  kwh: number;
  yoy: number;
}

export interface ComplexRow {
  park: string;
  /** 与 MONTHS 对齐：每个月一个 电量 + 同比 */
  cells: ComplexCell[];
  quarter: number;
}

export const COMPLEX_ROWS: ComplexRow[] = PARKS.map((park) => {
  const cells = MONTHS.map((month) => {
    const rows = pickRows((r) => r.park === park && r.month === month);
    const kwh = sumKwh(rows);
    const yoy = rows.length ? rows.reduce((acc, r) => acc + r.yoy, 0) / rows.length : 0;
    return { month, kwh, yoy };
  });
  return { park, cells, quarter: cells.reduce((acc, c) => acc + c.kwh, 0) };
});

// ───────────────────────── 指标卡 + 图文报表 ─────────────────────────
export interface MonthSummary {
  month: string;
  kwh: number;
  yoy: number;
}

export const MONTH_SUMMARY: MonthSummary[] = MONTHS.map((month) => {
  const rows = pickRows((r) => r.month === month);
  const kwh = sumKwh(rows);
  const yoy = rows.length ? rows.reduce((acc, r) => acc + r.yoy, 0) / rows.length : 0;
  return { month, kwh, yoy };
});

export const PARK_SUMMARY = PARKS.map((park) => {
  const rows = pickRows((r) => r.park === park);
  return {
    park,
    kwh: sumKwh(rows),
    yoy: rows.length ? rows.reduce((acc, r) => acc + r.yoy, 0) / rows.length : 0,
  };
});

/** 末月对中月的环比 */
export const MOM_TOTAL = (() => {
  const last = MONTH_SUMMARY[2]?.kwh ?? 0;
  const prev = MONTH_SUMMARY[1]?.kwh ?? 0;
  return prev ? ((last - prev) / prev) * 100 : 0;
})();

export const TOTAL_KWH = sumKwh(REPORT_ROWS);

export const TOTAL_YOY = (() => {
  const yoys = REPORT_ROWS.map((r) => r.yoy);
  return yoys.length ? yoys.reduce((a, b) => a + b, 0) / yoys.length : 0;
})();

/** 某园区下 台区 × 月份 的明细（图文报表联动用） */
export const parkDetail = (park: string) =>
  TRANSFORMERS.map((transformer) => ({
    transformer,
    values: MONTHS.map((month) => sumKwh(pickRows((r) => r.park === park && r.transformer === transformer && r.month === month))),
    total: sumKwh(pickRows((r) => r.park === park && r.transformer === transformer)),
  }));
