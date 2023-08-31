import { reactive } from 'vue';

import { ConditionGroup, ConditionGroupClazz } from './entity/conditionGroup';
import { cloneDeep } from 'lodash';

/**
 * 服务
 */
class DraggableFormulaService {
  // 开关
  public visible: boolean = false;
  //  条件组
  public groupList: ConditionGroupClazz[] = [];

  constructor() {
    this.groupList = [];
  }
  /**
   * 查询
   */
  public queryGroup() {
    console.log(this.groupList);
  }
  /**
   * 新增条件组
   * @param group
   */
  public addGroup() {
    const group = new ConditionGroup();
    this.groupList.push(group);
  }
  /**
   * 复制条件组
   * @param group
   * @param index
   */
  public copyGroup(group: ConditionGroupClazz, index: number) {
    this.groupList.splice(index, 0, cloneDeep(group));
  }
  /**
   * 删除某一个条件组
   * @param index
   */
  public deleteGroup(index: number) {
    this.groupList.splice(index, 1);
  }
}

const draggableFormulaService = reactive(new DraggableFormulaService());

export default draggableFormulaService;
