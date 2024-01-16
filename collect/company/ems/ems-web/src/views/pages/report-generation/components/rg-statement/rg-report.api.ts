export interface RG_IStateMent {
  downloading: boolean;
  loading: boolean;
  showNoData: boolean;
  errorMessage: string;
  stateMentList: RG_IStatementList[];
}

export interface RG_IStatementList {
  groupName: string;
  reportList: RG_ICardVO[];
}

export interface RG_ICardVO {
  createTime: string;
  name: string;
  updateTime: string;
  followFlag: string;
  id: number;
}

export interface Rg_IDownloadForm {
  excelConfigId: string;
  exportType: string;
  startTime: string;
  endTime: string;
  energyCode: string[];
  timeUnit: string;
  treeIds: number[];
  deviceIds: number[];
  radioValue: number;
  date: Date[];
}
