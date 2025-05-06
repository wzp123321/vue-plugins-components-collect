import { GPS_INeedConfigureDataIndexVO, GPS_INeedConfigureFormulaIndexVO } from '../plugins-draggable-formula.api';
import { Condition, ConditionClazz } from './condition';

export interface ConditionGroupClazz {
  id: number | null;
  startPeriod: number | null;
  endPeriod: number | null;
  conditionList: ConditionClazz[];
  configuredFormulaIndexList: GPS_INeedConfigureFormulaIndexVO[];
  configuredDataIndexList: GPS_INeedConfigureDataIndexVO[];
  mapStartPeriodDisabled: (value: number) => boolean;
  mapEndPeriodDisabled: (value: number) => boolean;
  addCondition: () => void;
  copyCondition: (condition: ConditionClazz, index: number) => void;
  deleteCondition: (index: number) => void;
  addConfiguredDataIndex: (value: GPS_INeedConfigureDataIndexVO) => void;
  addConfiguredFormulaIndex: (value: GPS_INeedConfigureFormulaIndexVO) => void;
}

export class ConditionGroup implements ConditionGroupClazz {
  // ID
  public id: number | null = null;
  // 开始托管期
  public startPeriod: number | null = null;
  // 结束托管期
  public endPeriod: number | null = null;
  // 条件列表
  public conditionList: ConditionClazz[] = [];
  // 需配置公式的标签列表
  public configuredFormulaIndexList: GPS_INeedConfigureFormulaIndexVO[] = [];
  // 需配置数据的标签列表
  public configuredDataIndexList: GPS_INeedConfigureDataIndexVO[] = [];
  // 初始化
  constructor() {
    this.startPeriod = null;
    this.endPeriod = null;
    this.conditionList.push(new Condition());
    this.configuredDataIndexList = [];
    this.configuredFormulaIndexList = [];
  }
  /**
   * 开始托管期禁用
   * @param value
   * @returns
   */
  public mapStartPeriodDisabled(value: number) {
    return this.endPeriod !== null && value >= this.endPeriod;
  }
  /**
   * 结束托管期禁用
   * @param value
   * @returns
   */
  public mapEndPeriodDisabled(value: number) {
    return this.startPeriod !== null && value <= this.startPeriod;
  }
  /**
   * 新增条件
   */
  public addCondition() {
    this.conditionList.push(new Condition());
  }
  /**
   * 复制某个条件
   * @param condition
   * @param index
   */
  public copyCondition(condition: ConditionClazz, index: number) {
    this.conditionList.splice(index, 0, condition);
  }
  /**
   * 删除某一个条件
   * @param index
   */
  public deleteCondition(index: number) {
    this.conditionList.splice(index, 1);
  }
  /**
   * 添加可配置公式的指标
   * @param value
   */
  public addConfiguredDataIndex(value: GPS_INeedConfigureDataIndexVO) {
    this.configuredDataIndexList.push(value);
  }
  /**
   * 添加可配置数据的指标
   * @param value
   */
  public addConfiguredFormulaIndex(value: GPS_INeedConfigureFormulaIndexVO) {
    this.configuredFormulaIndexList.push(value);
  }
}
