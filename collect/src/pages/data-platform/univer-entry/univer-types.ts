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

/** 数据验证 Builder（下拉 / 数字区间） */
export interface UDataValidationBuilder {
  requireValueInList(values: string[], multiple?: boolean, showDropdown?: boolean): UDataValidationBuilder;
  requireNumberBetween(start: number, end: number, isInteger?: boolean): UDataValidationBuilder;
  setAllowBlank(allow: boolean): UDataValidationBuilder;
  setOptions(options: { showErrorMessage?: boolean; error?: string }): UDataValidationBuilder;
  build(): unknown;
}

/** 单元格 / 区间句柄（FRange 的最小可用子集） */
export interface URange {
  getValues(): unknown[][];
  setValues(values: unknown[][]): URange;
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

/** 筛选模型（FFilter 的最小可用子集） */
export interface UFilter {
  getFilteredOutRows(): number[];
}

/** 工作表句柄（FWorksheet 的最小可用子集） */
export interface USheet {
  getRange(row: number, column: number, numRows?: number, numColumns?: number): URange;
  getRange(a1: string): URange;
  getRange(range: UIRange): URange;
  getLastRow(): number;
  getActiveCell(): URange | null;
  setColumnWidth(column: number, width: number): void;
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
  getActiveSheet(): USheet;
  onSelectionChange(cb: (ranges: UIRange[]) => void): unknown;
  onCommandExecuted(cb: () => void): unknown;
}

/** Facade API 入口（FUniver 的最小可用子集） */
export interface UApi {
  createWorkbook(data: unknown): UWorkbook;
  newDataValidation(): UDataValidationBuilder;
  undo(): void;
  redo(): void;
  toggleDarkMode(dark: boolean): void;
}
