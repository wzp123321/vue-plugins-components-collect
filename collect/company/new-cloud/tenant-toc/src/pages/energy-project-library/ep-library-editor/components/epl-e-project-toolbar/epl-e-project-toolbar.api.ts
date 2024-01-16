export interface DialogProps {
  visible: boolean;
  title: string;
  width: number;
  type: string;
  id: number;
}

export enum DialogType {
  删除项目 = 'deleteProject',
  查看历史版本 = 'viewHistoricalVersion',
}

export interface HistoryVersionDateList {
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
