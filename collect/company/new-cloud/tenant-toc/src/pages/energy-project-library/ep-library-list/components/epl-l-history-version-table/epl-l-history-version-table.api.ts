export interface EnergyProjectLibrarySelectVersionPage {
  pageNum?: number;
  pageSize?: number;
  searchCount?: boolean;
  orders?: {
    column?: string;
    asc?: boolean;
  }[];
  hospitalId?: number;
}

export interface EnergyProjectLibrarySelectVersionData {
  id?: number;
  createTime?: string;
  updateTime?: string;
  /**
   * 医院id
   */
  hospitalId?: number;
  /**
   * 操作人
   */
  operator?: string;
  /**
   * 是否删除（0否 1是）
   */
  deleteFlag?: number;
  /**
   * 版本创建时间
   */
  versionTime?: string;
}
