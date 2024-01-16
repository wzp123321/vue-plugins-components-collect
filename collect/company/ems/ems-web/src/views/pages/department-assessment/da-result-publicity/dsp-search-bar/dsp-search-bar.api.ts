// 表单
export interface DSB_IPageForm {
  /**
   * 能源类型
   */
  energyCode: string;
  /**
   * 日期
   */
  date: Date | undefined;
  /**
   * 指标
   */
  indexId: number | undefined;
}
