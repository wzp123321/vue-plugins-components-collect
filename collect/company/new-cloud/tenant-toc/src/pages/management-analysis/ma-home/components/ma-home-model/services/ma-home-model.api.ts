/**
 * 节能总收益折线图/表格数据/技术节能折线图
 * @param queryStart 起始时间
 * @param queryEnd 结束时间
 */
export interface MhmEnergyTotal {
  queryStart: string;
  queryEnd: string;
}

/**
 * 技术节能表格数据
 * @param projectCode 项目编码
 * @param queryStart 起始时间
 * @param queryEnd 结束时间
 */
export interface MhmEnergySavingTable {
  projectCode: string | undefined;
  queryStart: string;
  queryEnd: string;
}
/**
 * 技术节能表格数据
 * @param projectCode 项目编码
 * @param queryStart 起始时间
 * @param queryEnd 结束时间
 */
export interface MhmGoodsCost {
  queryStart: string;
  queryEnd: string;
}
