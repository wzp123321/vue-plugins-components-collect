export interface CAR_IEditStore {
  rowIndex: number;
  columnKey: string;
  originValue: string;
}

export interface CAR_IColumnVO {
  key: string;
  title: string;
}

export interface CAR_IRes<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export enum CAR_ERowLevel {
  一级 = '1',
  二级 = '2',
  三级 = '3',
}
