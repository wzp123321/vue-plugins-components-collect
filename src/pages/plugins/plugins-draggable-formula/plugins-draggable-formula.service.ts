import { Ref, ref } from 'vue';
import {
  GPS_INeedConfigureDataIndexVO,
  GPS_INeedConfigureFormulaIndexVO,
  GPS_IConditionVO,
  GPS_ISingleCondition,
} from './plugins-draggable-formula.api';

/**
 * 条件组Class
 */
interface ConditionGroupClazz {
  // 条件组列表
  groupList: Ref<ConditionGroupVO[]>;
  // 查询条件组
  queryGroup: () => void;
  // 新增条件组
  addGroup: () => void;
  // 复制条件组
  copyGroup: (group: ConditionGroupVO, index: number) => void;
  // 删除条件组
  deleteGroup: (index: number) => void;
}

/**
 * 条件Class
 */
interface ConditionClazz {
  // ID
  id: number;
  // 条件列表
  conditionList: GPS_ISingleCondition[];
  // 添加条件
  addCondition: () => void;
  // 添加判断条件
  addJudgementCondition: () => void;
  // 复制条件
  copyCondition: (condition: GPS_IConditionVO, index: number) => void;
  // 删除条件
  deleteCondition: (index: number) => void;
}

/**
 * 条件组
 */
export class ConditionGroupVO {
  /**
   * 开始托管期
   */
  public startPeriod: number | null = null;
  /**
   * 结束托管期
   */
  public endPeriod: number | null = null;
  /**
   * 条件列表
   */
  public conditionList: ConditionClazz[] = [];
  /**
   * 需配置公式的标签列表
   */
  public configuredFormulaIndexList: GPS_INeedConfigureFormulaIndexVO[] = [];
  /**
   * 需配置数据的标签列表
   */
  public configuredDataIndexList: GPS_INeedConfigureDataIndexVO[] = [];
}

/**
 * 服务
 */
class DraggableFormulaService implements ConditionGroupClazz {
  // 开关
  public visible = ref<boolean>(false);
  //  条件组
  public groupList = ref<ConditionGroupVO[]>([]);

  constructor() {}
  /**
   * 查询
   */
  public queryGroup() {
    console.log(this.groupList.value);
    const group = new ConditionGroupVO();
    this.groupList.value.push(group);
  }
  /**
   * 新增条件组
   * @param group
   */
  public addGroup() {
    const group = new ConditionGroupVO();
    this.groupList.value.push(group);
  }
  /**
   * 复制条件组
   * @param group
   * @param index
   */
  public copyGroup(group: ConditionGroupVO, index: number) {
    this.groupList.value.splice(index, 0, group);
  }
  /**
   * 删除某一个条件组
   * @param index
   */
  public deleteGroup(index: number) {
    this.groupList.value.splice(index, 1);
  }
}

export default new DraggableFormulaService();
