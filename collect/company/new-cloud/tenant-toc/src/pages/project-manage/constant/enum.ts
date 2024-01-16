/*
 * @Description: 枚举
 * @Autor: zpwan
 * @Date: 2022-04-13 10:18:09
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-11-15 10:04:06
 */

export enum PM_EPath {
  保存院方部分缴费能源类型 = '/projectManagement/saveJiaoFeiEnergyCode',
}

// 基准类型
export enum BenchmarkTypeEnum {
  PINTO_TYPE = '1', // 平托型
  INCREASE_TYPE = '2', // 递增型
}

// 托管类型
export enum HostingTypeEnum {
  HOSTING_NUMBER = '1', // 托量型
  HOSTING_PRICE = '2', //托价型
}

// 节能项目
export enum ProjectCodeEnum {
  CENTRAL_AIR_CONDITIONING = '1', // 中央空调
  BOILER = '2', // 锅炉
  INTELLIGENT_LIGHTING = '3', // 智慧照明
  OTHERS = '4', // "其他");
}

// 项目状态
export enum ProjectStatusEnum {
  NO_PASS = '1', // 已签约未进场
  CONSTRUCTION_PERIOD = '2', // 建设期
  OPERATION_PERIOD = '3', // 运营期
}

// 项目风险评级
export enum RiskRatingEnum {
  SHARPNESS_BORDER = '1', // 边界清晰
  HAS_BOUNDARY = '2', // 有一定边界
  NO_BOUNDARY = '3', // 无边界
}

// 收益分享模式
export enum PM_EGrainSharingMode {
  '保证伙伴收益型' = 0,
  节能收益天溯分享型 = 1,
}

// 收益分享对象
export enum PM_EGrainSharingObject {
  '国网/资方' = 0,
  '院方' = 1,
  天溯 = 2,
}

// 收益分享类型
export enum PM_EGrainSharingType {
  固定收益 = 0,
  收益分享 = 1,
  其他收益 = 2,
}

// 单价调差方式
export enum PM_EPriceAdjustmentType {
  变动实时调整 = 1,
  '浮动区间内不调，超出合同单价全调' = 2,
  '浮动区间内不调，超出区间外的部分调整' = 3,
  无限风险 = 4,
}

// 调整时间
export enum PM_EAdjustmentTime {
  月度调整 = 1,
  年度调整 = 2,
}

// 单价类型
export enum PM_EPriceType {
  当月实际单价 = 1,
  综合平均单价 = 2,
  自定义单价 = 3,
}

// 调整基数
export enum PM_EAdjustmentBasis {
  基准值 = 1,
  实际值 = 2,
}

// 项目收入模块
export enum PM_EProjectIncomeType {
  项目预算表 = 1,
  项目核算表 = 2,
}

// 选择托管期
export enum PM_EProjectPeriodType {
  全周期 = 1,
  自定义 = 2,
}

// 核算涉及费用类型
export enum PM_IFeeNodeType {
  天溯代缴费 = 1,
  院方部分缴费 = 2,
  存在平托区域 = 3,
  已有平台报价 = 4,
  运维服务费 = 5,
  设备维保服务费 = 6,
}

export enum PM_EDialogType {
  固定收益 = 0,
  其他收益 = 2,
  运维服务费 = 5,
  设备维保服务费 = 6,
  定值指标,
}
