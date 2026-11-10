// Univer BI 数据录入台 —— 列元信息与示例数据（数据契约层）
// ============================================================================
// 本文件职责：
//   1. 定义录入台唯一的列模型 ColDef（类型/必填/校验规则/跨列规则/下拉选项/列宽/可见性）；
//   2. 定义"表头行 + 数据行"到 Univer 网格行号的换算常量与工具；
//   3. 提供示例数据生成器与值归一化工具（写入前/读取后统一口径）。
//
// 在整体架构中的角色：对应 vxe 版 excel-data-entry-vxe/types.ts。
//   Univer 自身持有单元格数据（画布表格是唯一真相源），本文件只描述"每列是什么"，
//   校验、条件格式、数据验证、导入导出、列设置抽屉全部依赖这里的模型。
//
// 与 vxe 版的差异：
//   - vxe 行对象带 __id / __dirty，靠行对象追踪脏标记；
//     Univer 没有行对象，脏标记改为"与基线快照逐格比对"，故这里不再有 Row 类型。
//   - 列顺序 == 网格列顺序（A、B、C…），列增删移位会整体重写表头与数据。
// ============================================================================

/* ⚠️ 列类型 / 校验规则 / 空值判定 / 跨列规则这些「三套共用」的定义统一放在
   utils/bi-entry.ts：这里 import 进来再用，同时原样转发给上层，
   保证三套 schema 对外暴露的类型名和语义一致，改口径只改一处。 */
import {
  DEFAULT_DATE_FORMAT,
  cloneRows,
  crossError,
  emptyValueFor,
  formatDate,
  isBlank,
  isMetaField,
  isRealDate,
  normalizeDate,
  numOf,
  pad2,
  renderDate,
  round2,
  rowIsEmpty,
  rowSignature,
  sigValueOf,
  tsName,
  type BiColLike,
  type ColRule,
  type ColType,
  type CrossKind,
  type CrossRule,
} from '@/utils/bi-entry';
import { findRegionByName, isRegionValue } from './region-data';

export type { ColRule, ColType, CrossKind, CrossRule };
export {
  DEFAULT_DATE_FORMAT,
  cloneRows,
  crossError,
  emptyValueFor,
  formatDate,
  isBlank,
  isMetaField,
  isRealDate,
  normalizeDate,
  numOf,
  pad2,
  renderDate,
  round2,
  rowIsEmpty,
  rowSignature,
  sigValueOf,
  tsName,
};

/**
 * 单列定义（录入台列结构的原子单元）。
 * 继承 BiColLike：三套录入台的列模型共享同一套字段名与语义，
 * 共用函数（跨列规则 / 空值 / 日期归一）才能直接吃进来。
 */
export interface ColDef extends BiColLike {
  /** 基准列宽（px） */
  width: number;
  /** 是否在网格中可见（隐藏列保留数据，只 hideColumn） */
  visible: boolean;
}

/** 一条录入记录：字段 → 值。字段名与 ColDef.field 一一对应 */
export type EntryRecord = Record<string, unknown>;

/** 表头所在网格行（0-based），数据从下一行开始 */
export const HEADER_ROW = 0;
/**
 * 表头底色：**恒为亮色值**。Univer 的暗色是反色实现的（CanvasColorService 按 darkMode 反转），
 * 表头底色写进单元格后同样参与反转，所以暗黑下不要另写深色，否则会被翻成亮色、表头反而发白。
 * 取值与全局 --bi-head-bg（亚灰 #f7f8fa）一致，保证三套录入台表头同色。
 */
export const HEADER_BG_LIGHT = '#f7f8fa';
/** 数据行下标（0-based）→ 网格行号 */
export const toSheetRow = (dataIndex: number): number => dataIndex + HEADER_ROW + 1;
/** 网格行号 → 数据行下标（表头行返回 -1） */
export const toDataIndex = (sheetRow: number): number => sheetRow - HEADER_ROW - 1;

export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期', region: '院区' };

/** 网格最大行数（建表时一次性给足，避免边录边扩行触发重排） */
export const SHEET_ROW_COUNT = 20000;
/** 网格最大列数 */
export const SHEET_COLUMN_COUNT = 60;

/**
 * 网格密度：与另两套录入台对齐（vxe 行高 36 / 字号 12.5，vtable-sheet 行高 36 / 字号 12）。
 * Univer 默认 20px 行高 + 11pt 字号偏挤，三页并排时密度差最扎眼。
 */
export const ENTRY_ROW_HEIGHT = 36;
/** 表头行高：比数据行再高一档，列名与数据区有明确分界 */
export const HEADER_ROW_HEIGHT = 40;
/** 单元格字号（Univer 的 fs 按 pt 数值直接渲染，12.5 ≈ 12.5px） */
export const ENTRY_FONT_SIZE = 12.5;
/** 表头下边框色：数据区与表头之间的一条实线分隔 */
export const HEADER_BORDER_COLOR = '#e3e6ec';

// 压测/示例数据字典（与 vxe 版保持一致，便于横向对比两种实现的性能表现）
export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

/** 日期列存储口径：一律 YYYY-MM-DD（显示与校验都以此为准） */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 按列结构造一条空记录 */
export const makeEmptyRecord = (defs: ColDef[]): EntryRecord => {
  const rec: EntryRecord = {};
  defs.forEach((d) => {
    rec[d.field] = emptyValueFor(d);
  });
  return rec;
};

/** 默认列结构（员工主数据，覆盖四种列类型 + 必填 + 唯一 + 正则 + 跨列规则） */
export const DEFAULT_COLS: ColDef[] = [
  { field: 'name', label: '姓名', type: 'text', required: true, width: 120, visible: true, rules: { minLen: 2, maxLen: 12 } },
  { field: 'age', label: '年龄', type: 'number', required: true, width: 90, visible: true, rules: { min: 18, max: 65 } },
  { field: 'department', label: '部门', type: 'select', options: DEPARTMENTS, required: true, width: 110, visible: true },
  {
    field: 'joinDate',
    label: '入职日期',
    type: 'date',
    required: true,
    width: 130,
    visible: true,
    cross: [{ kind: 'lte', other: 'leaveDate', msg: '入职日期不能晚于离职日期' }],
  },
  { field: 'leaveDate', label: '离职日期', type: 'date', width: 130, visible: true },
  { field: 'status', label: '状态', type: 'select', options: STATUSES, required: true, width: 100, visible: true },
  { field: 'remark', label: '备注', type: 'text', width: 160, visible: true },
];

/**
 * 生成 n 条真实感示例记录。
 * 离职员工才填离职日期，给"入职 ≤ 离职"这条跨列规则提供真实数据面。
 */
export const genSampleRecords = (n: number, defs: ColDef[] = DEFAULT_COLS): EntryRecord[] => {
  const list: EntryRecord[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const name = SURNAMES[i % SURNAMES.length] + GIVEN[(i * 3) % GIVEN.length];
    const age = 22 + (i % 40);
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const year = 2018 + (i % 8);
    const month = 1 + (i % 12);
    const day = 1 + ((i * 5) % 27);
    const joinDate = `${year}-${pad2(month)}-${pad2(day)}`;
    const status = STATUSES[i % STATUSES.length];
    const leaveDate = status === '离职' ? `${year + 2}-${pad2(month)}-${pad2(day)}` : '';
    const raw: EntryRecord = {
      name,
      age,
      department,
      joinDate,
      leaveDate,
      status,
      remark: CITIES[i % CITIES.length],
    };
    const rec = makeEmptyRecord(defs);
    defs.forEach((d) => {
      rec[d.field] = d.field in raw ? raw[d.field] : emptyValueFor(d);
    });
    list[i] = rec;
  }
  return list;
};



// ===================== 单元格值契约 =====================
/**
 * 院区列在网格里存的是 ICellData：
 *   { v: 院区名称, custom: { name, id, code } }
 * `v` 是字符串 → 走 Univer 原生文本渲染（暗色反色 / 字体 / 筛选 / 排序 / 复制粘贴
 * 全部自动兼容）；`custom` 是官方字段，mergeCellData 会保留并深拷贝 → 存 id / code。
 * 不把对象塞进 `v`：对象会被判成 FORCE_STRING，画布上显示 "[object Object]"。
 * FRange.setValues 逐格调 covertCellValue，混合「标量 + ICellData」矩阵是官方支持的。
 */
export type CellWriteValue =
  | string
  | number
  | { v: string; t?: number; s?: unknown; custom?: Record<string, unknown> | null };

/** FRange.getCellDatas() 返回的原始单元格，只取本页用到的两个字段 */
export interface RawCellData {
  v?: unknown;
  custom?: Record<string, unknown> | null;
}

const isRawCellData = (v: unknown): v is RawCellData =>
  !!v && typeof v === 'object' && !Array.isArray(v) && ('v' in v || 'custom' in v);

/** 院区值 → 展示名：导出 Excel / CSV、错误清单、状态栏一律只输出 name */
export const regionNameOf = (v: unknown): string => {
  if (isRegionValue(v)) return v.name;
  return isBlank(v) ? '' : String(v);
};

/** 按列类型取展示文本（院区取 name，其余原样转字符串） */
export const displayTextOf = (d: { type: ColType }, v: unknown): string => {
  if (d.type === 'region') return regionNameOf(v);
  return isBlank(v) ? '' : String(v);
};

/**
 * Excel 日期序列号 → YYYY-MM-DD。
 *
 * 为什么需要：写入 "2018-01-01" 这类字符串时，Univer 会**自动识别成日期单元格**
 * （单元格变成 `{ v: 43101, t: 2, s: <日期格式样式> }`，画布上仍显示 2018-01-01）。
 * 读回来 `v` 是序列号，按字符串比 DATE_PATTERN 必然不匹配 → 整列被误判「格式应为 YYYY-MM-DD」标红。
 * 反算基准取 1899-12-30（Excel 1900 日期系统，含 1900 闰年兼容偏移）。
 */
export const dateSerialToYmd = (serial: number): string => {
  const days = Math.floor(serial);
  if (!Number.isFinite(days) || days < 1) return '';
  const d = new Date(days * 86400000 + Date.UTC(1899, 11, 30));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

/** 写入网格前的出参归一化：数字转 number（空→空串），院区转 ICellData，日期写成字符串单元格，其余转字符串 */
export const toCellValue = (d: ColDef, v: unknown): CellWriteValue => {
  if (d.type === 'number') {
    if (isBlank(v)) return '';
    const n = Number(v);
    return Number.isNaN(n) ? '' : n;
  }
  if (d.type === 'date') {
    if (isBlank(v)) return '';
    /*
     * 日期写成**字符串单元格**（t: 1 = STRING），不能直接传字符串。
     * 直接传 "2018-01-01" 时 Univer 的 covertCellValue 会走 numfmt 解析，把它存成
     * 「序列号 + 日期格式」（v=43101, s={n:{pattern:'yyyy-mm-dd'}}）；此后这一列每格都带日期格式，
     * 于是用户随手敲的 123 也会被渲染成 1900-05-02 —— 校验看到的是一个"合法日期"，自然通过。
     * 传 ICellData 则原样入库（covertCellValue 里 `isICellData(value) return value`），
     * 单元格保持文本、没有日期格式，敲什么就显示什么，格式错能被校验抓住。
     */
    return { v: normalizeDate(String(v)) ?? String(v), t: 4, s: { n: { pattern: '@' } } };
  }  if (d.type === 'region') {
    // 业务侧可能传 RegionValue 对象，也可能传名称（导入 / 批量填充按名称反查）
    const region = isRegionValue(v) ? v : findRegionByName(v);
    if (!region) return { v: '', custom: null };
    return {
      v: region.name,
      custom: { name: region.name, id: region.id, code: region.code },
    };
  }
  return isBlank(v) ? '' : String(v);
};

/**
 * 从网格读回后的入参归一化。
 * 同时兼容两种入参：readRecords 传原始 ICellData（含 custom），导入 / 其它调用方传标量。
 * 院区列优先取 custom；手写文本导致 custom 丢失时按名称反查，查不到视为未选。
 *
 * @param display 该格在画布上**显示出来的文字**（getDisplayValues 的结果）。
 *   只对日期列生效，理由见下面日期分支的注释 —— 这是区分"真日期"与"随手敲的数字"的唯一可靠信号。
 */
export const fromCellValue = (d: ColDef, v: unknown, display?: string): unknown => {
  const cell = isRawCellData(v) ? v : null;
  const raw = cell ? cell.v : v;
  if (d.type === 'number') {
    if (isBlank(raw)) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (d.type === 'region') {
    // 三种入参都要吃：网格原始 ICellData、业务侧 RegionValue、导入/批量填充的名称
    const custom = cell?.custom;
    const source = isRegionValue(custom) ? custom : raw;
    if (isRegionValue(source)) {
      return { name: source.name, id: source.id, code: source.code };
    }
    const hit = findRegionByName(source);
    return hit ? { ...hit } : '';
  }
  if (d.type === 'date') {
    if (isBlank(raw)) return '';
    /*
     * 【校验口径】以「画布上显示的文字」为准，而不是 cell.v。
     *
     * cell.v 不可信的根因：单元格里有没有日期格式，v 都只是一个数字。
     *   - 用户输入 2024-03-01 → Univer 识别为日期，套上日期格式，v=45352，显示 "2024-03-01"；
     *   - 用户随手敲 123      → Univer 当成普通数值，没有日期格式，v=123，显示 "123"。
     * 早期实现只按 v 走「Excel 序列号 → 日期」换算，于是 123 被算成 1900-05-02，
     * 任何数字都能通过日期校验（用户实测反馈的"输几个数字也通过"就是这个）。
     * 加上 display 后：显示值不像日期就直接把原样文本交出去，由校验报"格式应为 YYYY-MM-DD"。
     */
    const shown = (display ?? '').trim();
    if (shown) {
      if (DATE_PATTERN.test(shown)) return shown;
      // 输入 2024/3/1、2024年3月1日 这类写法时，Univer 的显示值就是原文本，这里归一成标准格式
      return normalizeDate(shown) ?? shown;
    }
    // 没有显示值（导入 / 批量写入等不经画布的调用方）：沿用旧的宽松口径
    const s = String(raw).trim();
    if (DATE_PATTERN.test(s)) return s;
    const n = Number(s);
    if (Number.isFinite(n) && n > 0 && n < 2958466) return dateSerialToYmd(n);
    return normalizeDate(s) ?? s;
  }
  return isBlank(raw) ? '' : String(raw);
};
