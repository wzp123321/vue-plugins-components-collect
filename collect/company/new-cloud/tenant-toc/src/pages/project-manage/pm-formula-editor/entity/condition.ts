import { cloneDeep } from 'lodash';
// api
import { ConditionClass, PFE_IConditionList, PFE_IIndexVO } from '../pm-formula-editor.api';
// 枚举
import { PM_EGrainSharingMode } from '../../constant/enum';
// store
import store from '../../../../store/index';

/**
 * 条件class
 */
export class Condition implements ConditionClass {
  // id
  public id: string = '';
  // 公式名称（国网分享、院方分享 、天溯分享）
  public indexName: string = '';
  // 公式号 （B9 、B10、T1）
  public serialNumber: string = '';
  // 0或 1与 默认为与（暂未使用）
  public logicalType: string = '0';
  // 判断条件-二维数组，兼容后续条件支持多个的情况
  public judgementConditions: PFE_IConditionList[] = [];
  // 计算公式，兼容后续条件支持多个的情况
  public computationalFormulas: PFE_IIndexVO[] = [];
  // 实例化
  constructor(instance?: ConditionClass) {
    this.id = '';
    this.logicalType = '0';
    this.indexName = cloneDeep(instance?.indexName) ?? PM_EGrainSharingMode[store?.getters?.grainSharingMode];

    this.judgementConditions = cloneDeep(instance?.judgementConditions) ?? [
      {
        conditionFormulaComponentList: [],
      },
    ];
    this.computationalFormulas = cloneDeep(instance?.computationalFormulas) ?? [];
  }
}
