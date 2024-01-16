import { Ecc_ISearchForm } from './components/ecc-search-bar/ecc-search-bar.api';
// 下降颜色
export const ECC_DOWNLOAD_COLOR = 'rgba(245, 34, 45, 1)';
// 上升颜色
export const ECC_UP_COLOR = 'rgb(82, 196, 26)';
// 能耗数据颜色组
export const ECC_ENERGY_COLORS = ['rgba(24, 144, 255, 1)', 'rgba(151, 164, 197, 1)', 'rgba(250, 173, 20, 1)'];
// 单价数据颜色组
export const ECC_PRICE_COLORS = ['rgba(24, 144, 255, 1)', 'rgba(250, 173, 20, 1)'];
// 节能数据颜色组
export const ECC_ENERGY_CONSERVATION_COLORS = ['rgb(24, 144, 255)', 'rgb(82, 196, 26)'];
// 单价折线图grid配置
export const priceGridOption = {
  left: '2%',
  right: '3%',
  top: '14%',
  bottom: '3%',
};
// 能耗折线图grid配置
export const energyGridOption = {
  left: '2%',
  right: '3%',
  top: '9%',
  bottom: '5%',
};

export interface ECC_IQueryParams extends Omit<Ecc_ISearchForm, 'hostingAreaId'> {
  /**
   * 日期  月:yyyy-MM  年:yyyy
   */
  startTimeStr?: string;
  /**
   * 日期  月:yyyy-MM  年:yyyy
   */
  endTimeStr?: string;
  /**
   * 托管区域id null即全部
   */
  hostingAreaId?: number | null;
}
/**
 * 能耗数据
 */
export interface ECC_IEnergyDataVO {
  /**
   * 单位
   */
  unit: string;
  /**
   * 实际能耗
   */
  actualValue: number | null;
  /**
   * 采集偏差值  （实际能耗量-采集值）
   */
  actualDiffValue: number | null;
  /**
   * 采集偏差比例 （实际能耗量-采集值）/实际能耗量
   */
  actualDiffRatio: string;
  /**
   * 同比能耗
   */
  yearOnYearValue: number | null;
  /**
   * 同比偏差值  （实际能耗量-同比能耗量）
   */
  yearOnYearDiffValue: number | null;
  /**
   * 同比偏差比例 （实际能耗量-同比能耗量）/同比能耗量
   */
  yearOnYearDiffRatio: string;
  /**
   * 预算能耗
   */
  budgetValue: number | null;
  /**
   * 预核算偏差值（预算能耗值-实际能耗量）
   */
  budgetDiffValue: number | null;
  /**
   * 预核算偏差比例 （预算能耗值-实际能耗量）/实际能耗量
   */
  budgetDiffRatio: string;
}
// 单价数据
export interface ECC_IPriceDataVO {
  /**
   * 单位
   */
  unit: string;
  /**
   * 合同单价
   */
  contractPrice: number | null;
  /**
   * 综合单价
   */
  comprehensivePrice: number | null;
}
/**
 * 响应结果
 */
export interface ECC_IEnergyControlVO {
  /**
   * 时间字符串
   */
  timeStr: string;
  /**
   * 能耗数据
   */
  dataVO: ECC_IDataVO;
  /**
   * 单价数据
   */
  priceVO: ECC_IPriceDataVO & {
    /**
     * 图表信息
     */
    chartVOList: ECC_IChartVO[];
  };
  /**
   * 节能信息
   */
  controlSavingVO: ECC_ISavingVO;
}
// 接口返回的能耗数据
export type ECC_IDataVO = ECC_IEnergyDataVO & {
  /**
   * 图表信息
   */
  chartVOList: ECC_IChartVO[];
};
// 接口返回的单价数据
export type ECC_IPriceVO = ECC_IPriceDataVO & {
  /**
   * 图表信息
   */
  chartVOList: ECC_IChartVO[];
};
// 接口返回的节能数据
export type ECC_ISavingVO = Ecc_ISavingCardDataVO & {
  /**
   * 图表信息
   */
  chartVOList: ECC_IChartVO[];
};

export interface ECC_IChartVO {
  /**
   * 类型名称
   */
  typeName: string;
  /**
   * 单位
   */
  unit: string;
  /**
   * 横坐标
   */
  xaxis: string[];
  /**
   * 数据列表
   */
  dataList: (number | null)[];
}

/**
 * 折线图
 * @param typeName 类型名
 * @param unit 单位
 * @param xaxis 横轴数据
 * @param data 数据
 */
export interface Ecc_ILineDataVO {
  typeName: string;
  unit: string;
  xaxis: string[];
  data: string[];
}

// 节能数据卡片
export interface Ecc_ISavingCardDataVO {
  manageSavingRatio: string;
  technicalSavingRatio: string;
}
