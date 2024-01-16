// 排序方式
export enum DRP_ESortType {
  降序 = '0',
  升序 = '1',
}
// 文本最大宽度
export const DRP_LABEL_MAX_WIDTH = 75;

// 查询入参
export interface DRP_IQueryParams {
  /**
   * 能源类型
   */
  energyCode: string;
  /**
   * 查询时间
   */
  queryTime: string;
  /**
   * 指标
   */
  indexId: number | undefined;
  /**
   * 排行顺序0- 倒序 1- 正序
   */
  rankOrder?: string;
  /**
   * 盈余顺序0- 倒序 1- 正序
   */
  ratioOrder?: string;
}
// 考核排行榜详情
export interface DRP_IAssessRankResultVO {
  /**
   * 节能总量
   */
  savingTotalValue: number | null;
  /**
   * 节能总量单位
   */
  unit: string;
  /**
   * 盈余排行榜单位
   */
  surplusRankUnit: string;
  /**
   * 盈余排行榜
   */
  surplusRankList: DA_SP_ISurplusRankVO[];
  /**
   * 盈余率排行榜
   */
  surplusRatioList: DA_SP_ISurplusRatioVO[];
}

// 盈余排行榜
export interface DA_SP_ISurplusRankVO {
  /**
   * 名称
   */
  name: string;
  /**
   * 盈余值
   */
  surplusValue: number;
  /**
   * 是否负值
   */
  negativeFlag: boolean;
}
// 盈余率排行榜
export interface DA_SP_ISurplusRatioVO {
  /**
   * 名称
   */
  name: string;
  /**
   * 盈余率（不带百分比）
   */
  ratioValue: number;
  /**
   * 是否负值
   */
  negativeFlag: boolean;
}
/**
 * 处理后的列表数据
 */
export interface DA_SP_IConvertRankTableVO {
  /**
   * 名称
   */
  name: string;
  /**
   * 值
   */
  value: string;
  /**
   * 是否是负数
   */
  negativeFlag: boolean;
  /**
   * 宽度
   */
  width: string;
}
/**
 * 考核结果
 */
export interface DRP_ConvertAssessResultVO
  extends Omit<DRP_IAssessRankResultVO, 'surplusRankList' | 'surplusRatioList'> {
  surplusRankList: DA_SP_IConvertRankTableVO[];
  surplusRatioList: DA_SP_IConvertRankTableVO[];
}
// 考核明细
export interface DRP_IDetailTableVO {
  /**
   * 表头
   */
  headList: string[];
  /**
   * 表格内容
   */
  bodyList: {
    /**
     * 单元格值
     */
    value: string;
    /**
     * 是否显示红色
     */
    redFlag: boolean;
  }[][];
}
/**
 * 考核明细
 */
export interface DRP_IConvertDetailTableVO extends Omit<DRP_IDetailTableVO, 'bodyList'> {
  bodyList: DRP_IConvertBodyVO[];
}

// body
export interface DRP_IConvertBodyVO {
  [key: string]: string | string[];
  /**
   * 是否显示红色的列
   */
  redColumns: string[];
}
