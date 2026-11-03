/**
 * Tabulator 6.x 无官方类型声明，这里补一份最小可用声明。
 * 只覆盖本工程使用到的表面；实例上其余方法通过索引签名兜底，
 * 既保证 vue-tsc 0 error，又不强制把整个 Tabulator 类型搬进来。
 */
declare module 'tabulator-tables' {
  export interface ColumnDefinition {
    title?: string;
    field?: string;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    editor?: string | unknown;
    editorParams?: Record<string, unknown>;
    formatter?: string | ((cell: CellComponent, params: Record<string, unknown>) => unknown) | unknown;
    /** 5/6 版签名：(mockCell, params, onRendered)，返回字符串/Node 才写进表头 */
    titleFormatter?: string | ((cell: CellComponent, params: Record<string, unknown>, onRendered?: (cb: () => void) => void) => unknown) | unknown;
    validator?: unknown;
    frozen?: boolean;
    visible?: boolean;
    cssClass?: string;
    headerSort?: boolean;
    /** 排序器：'string' | 'number' | 'date' | 'boolean' … */
    sorter?: string;
    /** 列头筛选器：'input' | 'list' | 'number' | 'tick' … */
    headerFilter?: string | unknown;
    headerFilterParams?: Record<string, unknown>;
    /** 单元格右键菜单项（Menu 模块的列级配置） */
    contextMenu?: unknown[];
    [key: string]: unknown;
  }

  export interface CellComponent {
    getValue(): unknown;
    getField(): string;
    getElement(): HTMLElement;
    getRow(): RowComponent;
    getColumn(): ColumnComponent;
    getData(): Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface RowComponent {
    getIndex(): number | string;
    getData(): Record<string, unknown>;
    getElement(): HTMLElement;
    getPosition(active?: boolean): number;
    /** 重跑该行所有单元格的 formatter（表级没有 reformat，只有行级有） */
    reformat(): void;
    updateData(data: Record<string, unknown>): Promise<unknown> | void;
    delete(): Promise<unknown> | void;
    scrollTo(): Promise<unknown>;
    [key: string]: unknown;
  }

  export interface ColumnComponent {
    getElement(): HTMLElement;
    getField(): string | null;
    isVisible(): boolean;
    setWidth(width: number | string): void;
    show(): void;
    hide(): void;
    delete(): void;
    [key: string]: unknown;
  }

  export interface Options {
    data?: Record<string, unknown>[];
    columns?: ColumnDefinition[];
    layout?: string;
    index?: string;
    selectableRows?: boolean | number;
    selectable?: boolean | number;
    [key: string]: unknown;
  }

  /** 完整构建（含全部模块）：ESM 无默认导出，实例化用它 */
  export class TabulatorFull {
    constructor(element: HTMLElement | string, options?: Options);
    setData(data: Record<string, unknown>[]): Promise<unknown>;
    getData(active?: boolean | string): Record<string, unknown>[];
    getRow(index: number | string): RowComponent;
    getRows(): RowComponent[];
    updateData(data: Record<string, unknown>[]): Promise<unknown>;
    addRow(data?: Record<string, unknown>, addToTop?: boolean, index?: number): Promise<unknown>;
    deleteRow(index: number | string): Promise<unknown>;
    getColumns(): ColumnComponent[];
    getColumn(field: string): ColumnComponent | undefined;
    setColumns(defs: ColumnDefinition[]): void;
    addColumn(def: ColumnDefinition, insertRightOf?: string | null, index?: number): Promise<unknown>;
    deleteColumn(field: string): Promise<unknown> | void;
    showColumn(field: string): void;
    hideColumn(field: string): void;
    redraw(force?: boolean): void;
    destroy(): void;
    /** 表根元素（原生事件监听挂它上面，随实例销毁一起消失） */
    element: HTMLElement;
    /** 当前所有范围选区（SelectRange 模块） */
    getRanges(): unknown[];
    /** 追加一个范围选区（右见菜单前把选区挪到被点的格子） */
    addRange(start?: unknown, end?: unknown): unknown;
    clearFilter(trigger?: boolean): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    scrollToRow(index: number | string, position?: string): Promise<unknown>;
    getSelectedData(): Record<string, unknown>[];
    selectRow(index?: number | string | (number | string)[]): void;
    deselectRow(): void;
    blockRedraw(): void;
    restoreRedraw(): void;
    [key: string]: unknown;
  }

  /** 核心构建别名（不含内置模块）；本工程统一用 TabulatorFull */
  export { TabulatorFull as Tabulator };
}
