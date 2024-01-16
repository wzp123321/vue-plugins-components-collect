import { PFE_EFixedType, PFE_ESymbolType } from './enums';

/**
 * 托管期
 */
export interface PFE_IPeriodVO {
  // ID
  id: number;
  // 名称
  name: string;
}

/**
 * 指标&符号
 */
export interface PFE_IIndexVO {
  /**
   * 组件的id 用prefix+序号
   */
  id: string;
  /**
   * 指标名称
   */
  indexName: string;
  /**
   * 指标公式号
   */
  serialNumber: string;
  /**
   * 指标类型：0基础指标 1定值指标 2运算指标
   */
  indexType: PFE_ESymbolType;
  /**
   * 是否系统内置  0内置，1非内置
   */
  fixed: PFE_EFixedType;
  /**
   * 是否勾选
   */
  selectFlag?: boolean;
  /**
   * 公式列表（定值为空）
   */
  formulaComponentList?: PFE_IIndexVO[];
}
/**
 * 条件组Class
 */
export interface ConditionGroupClass {
  groupId: string;
  startPeriod: number | null;
  endPeriod: number | null;
  conditionList: ConditionClass[];

  addCondition: () => void;
  copyCondition: (condition: ConditionClass, index: number) => void;
  deleteCondition: (index: number) => void;
}
/**
 * 条件Class
 */
export interface ConditionClass {
  id: string;
  // 判断条件-二维数组，兼容后续条件支持多个的情况
  judgementConditions: PFE_IConditionList[];
  // 计算公式，兼容后续条件支持多个的情况
  computationalFormulas: PFE_IIndexVO[];
  // 0或 1与 默认为与（暂未使用）
  logicalType: string;
  // 公式号 （B9 、B10、T1）
  serialNumber: string;
  // 公式名称（国网分享、院方分享 、天溯分享）
  indexName: string;
}
// 判断条件子元素
export interface PFE_IConditionList {
  conditionFormulaComponentList: PFE_IIndexVO[];
}

/**
 * 查询接口 [查询公式组信息与指标配置信息]
 */
export interface PFE_IGroupConfigInfoResponse {
  /**
   * 公式编号
   */
  formulaSerialNumber: string;
  /**
   * tenantId
   */
  tenantId: number;
  /**
   * 指标信息列表
   */
  indexInfoList: {
    /**
     * 指标名称
     */
    indexName: string;
    /**
     * 指标公式号
     */
    serialNumber: string;
    /**
     * 指标类型：0基础指标 1定值指标 2运算指标
     */
    indexType: string;
    /**
     * 公式列表（定值为空）
     */
    formulaComponentList: {
      /**
       * 组件的id 用prefix+序号
       */
      id: string;
      /**
       * 指标类型：0基础指标 1定值指标 2运算指标,
       */
      indexType: string;
      /**
       * 指标名称
       */
      indexName: string;
      /**
       * 指标公式号
       */
      serialNumber: string;
    }[];
    /**
     * 是否勾选中
     */
    selectFlag: boolean;
  }[];
  /**
   * 条件组信息列表
   */
  groupInfoList: {
    /**
     * 条件组id（新增为空）
     */
    groupId: string;
    /**
     * 开始托管期
     */
    startPeriod: number;
    /**
     * 结束托管期
     */
    endPeriod: number;
    /**
     * 公式列表
     */
    formulaList: {
      /**
       * 公式名称（国网分享、院方分享 、天溯分享）
       */
      indexName: string;
      /**
       * 公式号 （B9 、B10、T1）
       */
      serialNumber: string;
      /**
       * 公式列表
       */
      formulaComponentList: PFE_ERequestIndexVO[];
      /**
       * 0或 1与 默认为与（暂未使用）
       */
      logicalType: string;
      /**
       * 条件组（正常只会有1条，但是需支持多条件）
       */
      conditionList: {
        /**
         * 条件的公式列表
         */
        conditionFormulaComponentList: PFE_ERequestIndexVO[];
      }[];
    }[];
  }[];
  /**
   * 其他模式配置的公共指标
   */
  quoteCalculateIndexList?: PFE_ERequestIndexVO[];
}
// 返回的指标类型
export interface PFE_ERequestIndexVO {
  /**
   * 组件的id 用prefix+序号
   */
  id?: string;
  /**
   * 指标类型：0基础指标 1定值指标 2运算指标,
   */
  indexType: string;
  /**
   * 指标名称
   */
  indexName: string;
  /**
   * 指标公式号
   */
  serialNumber: string;
  /**
   * 列表
   */
  formulaComponentList?: PFE_ERequestIndexVO[];
}
// 指标信息列表
export interface PFE_IIndexInfoList {
  /**
   * id
   */
  id?: string;
  /**
   * 指标名称
   */
  indexName: string;
  /**
   * 指标公式号
   */
  serialNumber: string;
  /**
   * 指标类型：0基础指标 1定值指标 2运算指标
   */
  indexType: string;
  /**
   * 公式列表（定值为空）
   */
  formulaComponentList: {
    /**
     * 组件的id 用prefix+序号
     */
    id: string;
    /**
     * 指标类型：0基础指标 1定值指标 2运算指标,
     */
    indexType: string;
    /**
     * 指标名称
     */
    indexName: string;
    /**
     * 指标公式号
     */
    serialNumber: string;
  }[];
  /**
   * 是否勾选中
   */
  selectFlag: boolean;
}
// 条件组信息列表
export interface PFE_IGroupInfoList {
  /**
   * 条件组id（新增为空）
   */
  groupId: string;
  /**
   * 开始托管期
   */
  startPeriod: number | null;
  /**
   * 结束托管期
   */
  endPeriod: number | null;
  /**
   * 公式列表
   */
  formulaList: {
    /**
     * 公式名称（国网分享、院方分享 、天溯分享）
     */
    indexName: string;
    /**
     * 公式号 （B9 、B10、T1）
     */
    serialNumber: string;
    /**
     * 公式列表
     */
    formulaComponentList: {
      /**
       * 组件的id 用prefix+序号
       */
      id: string;
      /**
       * 指标类型：0基础指标 1定值指标 2运算指标,
       */
      indexType: string;
      /**
       * 指标名称
       */
      indexName: string;
      /**
       * 指标公式号
       */
      serialNumber: string;
    }[];
    /**
     * 0或 1与 默认为与（暂未使用）
     */
    logicalType: string;
    /**
     * 条件组（正常只会有1条，但是需支持多条件）
     */
    conditionList: {
      /**
       * 条件的公式列表
       */
      conditionFormulaComponentList: {
        /**
         * 组件的id 用prefix+序号
         */
        id: string;
        /**
         * 指标类型：0基础指标 1定值指标 2运算指标,
         */
        indexType: string;
        /**
         * 指标名称
         */
        indexName: string;
        /**
         * 公式号 （B9 、B10、T1）
         */
        serialNumber: string;
      }[];
    }[];
  }[];
}
/**
 * 保存接口入参
 */
export interface PFE_ISaveGroupConfigParams {
  /**
   * 指标信息列表
   */
  indexInfoList: PFE_IIndexInfoList[];
  /**
   * 条件组信息列表
   */
  groupInfoList: PFE_IGroupInfoList[];
  /**
   * 条件组编号
   */
  formulaSerialNumber: string;
  /**
   * tenantId
   */
  tenantId: number;
}
