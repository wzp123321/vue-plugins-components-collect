// 可拖拽的唯一标识
export const PDF_DRAGGABLE_CLASS = 'pdf-draggable';
// 指标类型
export enum PGS_ESymbolType {
  基础,
  定值,
  运算,
  时间,
  数字,
  运算符,
  判断符,
}

/**
 * 托管期
 */
export interface GPS_IPeriodVO {
  // ID
  id: number;
  // 名称
  name: string;
}

/**
 * 指标&符号
 */
export interface GPS_IIndexVO {
  // 指标类型
  indexType: PGS_ESymbolType;
  // ID
  id: string;
  // 名称
  name: string;
  // 值
  value: string;
  // 单位-目前只有%
  unit: string;
  // 唯一标识，用于拖拽
  serialNumber: string;
  // 是否可配置公式
  configureFormulaFlag: boolean;
  // 是否可配置数据
  configureDataFlag: boolean;
  // 是否可编辑
  editable: boolean;
  // 是否是预制数据
  prefabricateFlag: boolean;
}

/**
 * 需要配置公式的指标
 */
export interface GPS_INeedConfigureFormulaIndexVO extends GPS_IIndexVO {
  // 公式列表
  formulaList?: GPS_IIndexVO[];
}

/**
 * 需要配置数据的指标
 */
export interface GPS_INeedConfigureDataIndexVO extends GPS_IIndexVO {
  // 数据id
  dataId?: number;
}

/**
 * 条件组
 */

export interface GPS_IConditionGroupVO {
  // 开始托管期
  startPeriod: number | null;
  // 结束托管期
  endPeriod: number | null;
  // 条件列表
  conditionList: GPS_IConditionVO[];
  // 需配置公式的标签列表
  configuredFormulaIndexList: GPS_INeedConfigureFormulaIndexVO[];
  // 需配置数据的标签列表
  configuredDataIndexList: GPS_INeedConfigureDataIndexVO[];
}

/**
 * 条件详情
 */
export interface GPS_IConditionVO {
  // ID
  id: number;
  // 条件列表
  conditionList: GPS_ISingleCondition[];
}

/*
 * 单个条件
 */
export interface GPS_ISingleCondition {
  // 判断条件
  judgementConditionList: GPS_IIndexVO[];
  // 计算公式
  computationalFormulaList: GPS_IIndexVO[];
}
