export interface IFormData {
  province: string;
  importType: string;
  hospitalName: string;
  hospitalId: string;
  hospitalRelId: string;
}

export interface IKeyValue {
  code: string;
  name: string;
}

/**
 * 导入异常返回数据
 */
export interface ErrorDataListType {
  detail: string;
  position: string;
}

/**
 * 导入版本形式
 */
export enum HistoryFlagType {
  覆盖版本 = 0,
  保存为历史版本 = 1,
  初次导入 = 2,
}
