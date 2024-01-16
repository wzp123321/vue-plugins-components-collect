/**
 * 数据
 */
export interface ADBIM_IDataMaintainTableVO {
  stripeIndex: number;

  [key: string]: string | number;
}

/**
 * 列
 */
export interface ADBIM_IDataMaintainColumnVO {
  title: string;
  isLock: boolean;
}

export interface ADBIM_IDataMaintainRes {
  mergeDTOList: ADBIM_IMergeDTO[];
  hiddenColumns: number[];
  lockColumns: number[];
  tableData: string[][];
  tableHeads: string[][];
}

export interface ADBIM_IMergeDTO {
  endColumn: number;
  endRow: number;
  startColumn: number;
  startRow: number;
}

/**
 * 单元格编辑
 */
export interface ADBIM_ICellEditorVO {
  rowIndex: number;
  colunKey: string;
  originValue: string;
}

/**
 * 导入异常详情
 */
export interface ADBIM_IExceptionVO {
  position: string;
  detail: string;
}
