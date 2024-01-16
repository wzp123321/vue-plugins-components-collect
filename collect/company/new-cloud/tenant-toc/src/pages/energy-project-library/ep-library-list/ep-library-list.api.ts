export interface IFormData {
  /**
   * 医院名称
   */
  hospitalId: string | null;
  /**
   * 省份code
   */
  provinceCode: string | null;
  /**
   * 医院等级
   */
  hospitalLevel: string | null;
  /**
   * 关键字
   */
  keyword: string | null;
}

export interface IKeyValue {
  code: string;
  name: string;
}

export interface EnergyProjectLibrarySelectListPage {
  pageNum: number;
  pageSize: number;
  searchCount?: boolean;
  orders?: {
    column?: string;
    asc?: boolean;
  }[];
  /**
   * 综能项目库id
   */
  id?: string | null;
  /**
   * 省份code
   */
  provinceCode?: string | null;
  /**
   * 医院等级
   */
  hospitalLevel?: string | null;

  keyword?: string | null;
}

export interface EnergyProjectLibrarySelectListData {
  id?: number;
  createTime?: string;
  updateTime?: string;
  /**
   * 医院名称
   */
  hospitalName?: string;
  /**
   * 录入名称
   */
  hospitalExcelName?: string;
  /**
   * 省份code
   */
  provinceCode?: string;
  /**
   * '对标库简称'
   */
  benchmarkSimpleName?: string;
  /**
   * '医院简称'
   */
  hospitalSimpleName?: string;
  /**
   * 录入省份
   */
  provinceName?: string;
  /**
   * 录入城市
   */
  city?: string;
  /**
   * 医院等级
   */
  hospitalLevel?: string;
  /**
   * 医院类型
   */
  hospitalType?: string;
  /**
   * 气候区
   */
  climaticRegion?: string;
  /**
   * 录入人员
   */
  operator?: string;
  realName?: string;
  deletePermission?: number;
  bindHostingProjectName?: string;
}

export enum EDialogType {
  版本详情 = 'currentVersion',
  历史版本详情 = 'historyVersion',
  查看历史版本弹窗 = 'viewHistoricalVersion',
  单选删除弹窗 = 'singleDel',
  多选删除弹窗 = 'multipleDel',
  导入弹窗 = 'import',
}
