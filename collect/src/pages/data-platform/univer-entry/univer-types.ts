// Univer Facade 的最小类型面（本地声明）
// ============================================================================
// 为什么不用官方类型：本仓库 tsconfig 的 moduleResolution 是 "Node"（node10），
// 而 @univerjs/* 的类型全部走 package.json exports 的子路径（'@univerjs/core/facade'、
// '@univerjs/sheets/facade' 等），node10 解析不到 → presets 的 d.ts 里 `export * from
// '@univerjs/core/facade'` 全部落空，导致 FUniver / FWorksheet 等类型"不存在"。
//
// 取舍：这里只声明"本页真正调用到"的那一小撮方法（签名已对着 1.3.0 的 d.ts 逐条核过），
// 运行时用 as unknown as 一次转换接上。好处是不动全局 tsconfig、不引入 facade 子路径依赖；
// 代价是这些方法没有官方类型校验 —— 升级 Univer 时请对照官方 d.ts 复核本文件。
// ============================================================================

/** Univer 的区间描述（IRange 的最小可用子集） */
export interface UIRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

/** 条件格式 Builder（只用到数据条） */
export interface UCfBuilder {
  setDataBar(config: {
    min: { type: string; value: number };
    max: { type: string; value: number };
    isGradient?: boolean;
    positiveColor: string;
    nativeColor: string;
    isShowValue?: boolean;
  }): UCfBuilder;
  setRanges(ranges: unknown[]): UCfBuilder;
  build(): unknown;
}

/**
 * 数据验证规则选项。
 * renderMode 决定单元格**静态**怎么画，取 DataValidationRenderMode 的数值：
 *   0 TEXT 只画文本 / 1 ARROW 右侧常驻箭头 / 2 CUSTOM 同 ARROW 且 chip 带底色；
 * 不传等同于 CUSTOM。⚠️ 它是**数值枚举**（不是 'TEXT' 这类字符串），传字符串会被静默忽略。
 */
export interface UDataValidationOptions {
  showErrorMessage?: boolean;
  error?: string;
  renderMode?: number;
}

/** 数据验证 Builder（下拉 / 数字区间） */
export interface UDataValidationBuilder {
  requireValueInList(values: string[], multiple?: boolean, showDropdown?: boolean): UDataValidationBuilder;
  requireNumberBetween(start: number, end: number, isInteger?: boolean): UDataValidationBuilder;
  setAllowBlank(allow: boolean): UDataValidationBuilder;
  setOptions(options: UDataValidationOptions): UDataValidationBuilder;
  build(): unknown;
}

/** 原始单元格数据（ICellData 的最小可用子集）：v 是显示值，custom 存业务附加数据 */
export interface UCellData {
  v?: unknown;
  custom?: Record<string, unknown> | null;
}

/** 事件订阅句柄：destroy 时 dispose 解绑 */
export interface UDisposable {
  dispose(): void;
}

/**
 * 筛选模型（FFilter 的最小可用子集）。
 * 必须声明在 `URange` 之前：`URange.createFilter()` 引用了它。
 * `getRange()` 的返回写成内联结构而非 `URange`，否则两者互相引用，
 * 无论哪个写在前面都会被 `no-use-before-define` 判为「先用后定义」。
 */
export interface UFilter {
  getFilteredOutRows(): number[];
  /** 当前筛选区（用它判断列数是否已覆盖，避免每次重建都清掉用户已设的条件） */
  getRange(): { getRange(): UIRange };
  /** 移除筛选（放开漏斗 / 重建筛选区前调用） */
  remove(): boolean;
}

/** 单元格 / 区间句柄（FRange 的最小可用子集） */
export interface URange {
  getValues(): unknown[][];
  /** 原始 ICellData 矩阵（含 custom）；getValues() 只给 cell.v，拿不到院区 id/code */
  getCellDatas(): (UCellData | null)[][];
  /**
   * 按单元格数字格式渲染后的**显示文本**矩阵（如日期格 45352 → "2024-03-01"）。
   * 用途：日期列校验要看"用户看到的文字"，而不是底层的数值序列号。
   */
  getDisplayValues(): string[][];
  setValues(values: unknown[][]): URange;
  createFilter(): UFilter | null;
  getValue(): unknown;
  setValue(value: unknown): URange;
  getA1Notation(): string;
  getRow(): number;
  getColumn(): number;
  getRange(): UIRange;
  setBackground(color?: string | null): URange;
  setFontColor(color?: string | null): URange;
  setFontWeight(weight: string): URange;
  setHorizontalAlignment(align: string): URange;
  setVerticalAlignment(align: string): URange;
  /**
   * 边框：type 取 BorderType 字符串（'all' / 'outside' / 'bottom' / 'none' …），
   * style 取 BorderStyleTypes 数值（0 NONE / 1 THIN / 8 MEDIUM …）。
   * 传 'none' 即清除该区间内的边框，用于撤销错误标红。
   */
  setBorder(type: string, style: number, color?: string): URange;
  setDataValidation(rule: unknown | null): URange;
  clearContent(): URange;
  activate(): URange;
  /** 合并本区间（默认只保留左上角值） */
  merge(options?: { defaultMerge?: boolean; isForceMerge?: boolean }): URange;
  /** 拆分本区间内所有合并单元格 */
  breakApart(): URange;
  /** 本区间是否恰好是一个合并区域 */
  isMerged(): boolean;
  /** 本区间是否与某个合并区域重叠 */
  isPartOfMerge(): boolean;
}

/** 工作表句柄（FWorksheet 的最小可用子集） */
export interface USheet {
  /** 本表 id（下发选区操作等需要 subUnitId 的命令时用） */
  getSheetId(): string;
  getRange(row: number, column: number, numRows?: number, numColumns?: number): URange;
  getRange(a1: string): URange;
  getRange(range: UIRange): URange;
  getLastRow(): number;
  getActiveCell(): URange | null;
  setColumnWidth(column: number, width: number): void;
  /** 行高（px）：表头行比数据行高一档 */
  setRowHeight(row: number, height: number): void;
  hideColumn(column: number): void;
  showColumns(column: number): void;
  deleteColumn(column: number): void;
  setFreeze(freeze: { xSplit: number; ySplit: number; startRow: number; startColumn: number }): void;
  newConditionalFormattingRule(): UCfBuilder;
  addConditionalFormattingRule(rule: unknown): void;
  getConditionalFormattingRules(): { cfId?: string }[];
  deleteConditionalFormattingRule(cfId: string): void;
  getFilter(): UFilter | null;
  /** 当前表全部合并区域（各 FRange 的 A1 与尺寸都能读） */
  getMergeData(): URange[];
}

/** 工作簿句柄（FWorkbook 的最小可用子集） */
export interface UWorkbook {
  /** 工作簿 id（＝命令参数里的 unitId） */
  getId(): string;
  getActiveSheet(): USheet;
  onSelectionChange(cb: (ranges: UIRange[]) => void): unknown;
  onCommandExecuted(cb: () => void): unknown;
}

/** Facade API 入口（FUniver 的最小可用子集） */
export interface UApi {
  createWorkbook(data: unknown): UWorkbook;
  /** 执行命令（按 id 字符串）：本页只用来下发「清空选区」 */
  executeCommand(id: string, params?: object): Promise<boolean>;
  newDataValidation(): UDataValidationBuilder;
  undo(): void;
  redo(): void;
  toggleDarkMode(dark: boolean): void;
  /** 整体替换主题（不合并）：传入 {...defaultTheme, gray:{...}, primary:{...}} 全量对象 */
  setTheme(theme: unknown): void;
  /** 订阅 Univer 事件（事件名用 univerAPI.Event.* 的字符串，如 'CellClicked'） */
  addEvent(
    name: string,
    cb: (params: { row?: number; column?: number; worksheet?: unknown; workbook?: unknown }) => void,
  ): UDisposable;
}
