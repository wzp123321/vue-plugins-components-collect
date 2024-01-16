/**
 * @param month 月份
 * @param nodeId 节点id
 * @param originValue 原始值
 */
export interface MA_IMonthlyEditStore {
  month: number;
  nodeId: string;
  originValue: string;
  type: MA_EMonthlyNodeType;
}

export enum MA_EMonthlyNodeType {
  主节点 = 0,
  收入,
  成本,
  可研,
  预算,
}

export interface MA_IMonthlyNodeUpdateParams {
  month: string;
  nodeId: string;
  nodeType: number;
  nodeValue: string;
  tenantCode: string;
  tenantId: number;
  valueType: string;
  year: string;
}

export interface MA_IMonthlyFormInlineType {
  year: string | undefined;
  valueType: string | undefined;
  yearList: MonthlyData.type[];
  isThatYear: boolean;
}

export interface MA_IMonthlyBtnType {
  nodeImportLoading: boolean;
  dataImportLoading: boolean;
  nodeDownloadLoading: boolean;
  dataDownloadLoading: boolean;
  nodeDownloadUrl: string;
  dataDownloadUrl: string;

  nodeEditing: boolean;
}

export interface MA_IMonthlyTableType {
  loading: boolean;
  tableData: MonthlyData.TableDataSourceVO[];
  tableHeadData: MonthlyData.TableDataSourceVO;
  tableHeadIdData: MonthlyData.TableDataSourceVO;
  tableStore: MA_IMonthlyEditStore;
}

export interface MA_IMonthlyErrorDialog {
  errorDataList: MeasureLibrary.errorDataListType[];
  importErrorVisible: boolean;
}
export interface MA_IMonthlyvalueTypeObj {
  code: string;
  name: string;
}

// 数据源
export interface MA_IMonthlyTableVO {
  id: string;
  title: string;
  [key: string]: string | null;
}

export interface MA_IMonthlyTableHeadVO {
  props: string;
  title: string;
  month: string;
  editable: boolean;
}

export interface MA_IMonthlyRes {
  masterData: MA_IMonthlyDataVO;
  incomeData: MA_IMonthlyDataVO;
  costData: MA_IMonthlyDataVO;
}

export interface MA_IMonthlyDataVO {
  headList: (string | null)[];
  editList: boolean[];
  nodeDataList: MA_IMonthlyNodeDataList[];
}

export interface MA_IMonthlyNodeDataList {
  dataList: string[];
  nodeId: number;
  nodeName: string;
}
