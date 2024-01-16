/**
 * 系统管理表格
 */
export interface SystemManageTable {
  id: number | null;
  moduleName: string;
  moduleKey: string;
  configurationValue: string;
  configurationValueList: ConfigurationValueList[];
  chooseType: string;
  checkList: string[];
}
/**
 * 表格多选项
 */
export interface ConfigurationValueList {
  configurationItemCode: string;
  configurationItemName: string;
  itemSelectedFlag: boolean;
  checkList: string[];
}

/**
 * 更新表格参数
 */
export interface SystemManageTableUpdate {
  id: number;
  configurationValueList?: ConfigurationValueList[] | null;
  chooseType: string;
  configurationValue?: string;
}

/**
 * 更新表格的结果
 */
export interface ResultData {
  code?: number;
  data: boolean;
  state: number;
  message?: string;
}
