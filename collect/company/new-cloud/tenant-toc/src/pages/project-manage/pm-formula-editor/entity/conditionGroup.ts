// 实例
import { Condition } from './condition';
// 接口
import { ConditionClass, ConditionGroupClass } from '../pm-formula-editor.api';
// 工具方法
import { cloneDeep } from 'lodash';
// store
import store from '../../../../store/index';
/**
 * 条件组
 */
export class ConditionGroup implements ConditionGroupClass {
  // ID
  public groupId: string = '';
  // 开始托管期
  public startPeriod: number | null = null;
  // 结束托管期
  public endPeriod: number | null = null;
  // 条件列表
  public conditionList: ConditionClass[] = [];
  // 初始化
  constructor(instance?: ConditionGroup) {
    this.groupId = instance?.groupId ? (Math.random() * 100000000).toFixed(0) : '';
    this.startPeriod = null;
    this.endPeriod = null;
    this.conditionList = cloneDeep(instance?.conditionList) ?? [new Condition()];
  }
  /**
   * 新增条件
   * @returns {void}
   */
  public addCondition(): void {
    this.conditionList.push(new Condition());
    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
    console.log('%c✨✨新增条件✨✨', 'font-size: 24px', this.conditionList);
  }
  /**
   * 复制某个条件
   * @param {ConditionClass} condition 条件
   * @param  {number} index 索引
   * @returns {void}
   */
  public copyCondition(condition: ConditionClass, index: number): void {
    const cloneCondition = cloneDeep(condition);
    const instance = new Condition(cloneCondition);
    console.log('%c✨✨复制某个条件✨✨', 'font-size: 24px', cloneCondition, index, instance);
    this.conditionList.splice(index + 1, 0, cloneDeep(instance));

    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
  }
  /**
   * 删除某一个条件
   * @param  {number} index 索引
   * @returns {void}
   */
  public deleteCondition(index: number): void {
    console.log('%c✨✨删除某一个条件✨✨', 'font-size: 24px', index);
    this.conditionList.splice(index, 1);

    // 修改保存状态
    store.dispatch('setUnSaveFlag', true);
  }
}
