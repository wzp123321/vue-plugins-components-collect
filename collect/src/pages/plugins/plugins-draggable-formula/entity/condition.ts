import { Ref, ref } from 'vue';
import { GPS_IIndexVO } from '../plugins-draggable-formula.api';

export interface ConditionClazz {
  id: number | null;
  judgementConditions: Ref<GPS_IIndexVO[][]>;
  computationalFormulas: Ref<GPS_IIndexVO[][]>;
}

export class Condition implements ConditionClazz {
  public id: number | null = null;
  // 判断条件-二维数组，兼容后续条件支持多个的情况
  public judgementConditions = ref<GPS_IIndexVO[][]>([]);
  // 计算公式，兼容后续条件支持多个的情况
  public computationalFormulas = ref<GPS_IIndexVO[][]>([]);

  constructor() {
    this.id = Number((Math.random() * 100000000).toFixed(0));
    this.computationalFormulas.value = [];
    this.judgementConditions.value = [];
  }
}
