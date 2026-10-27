import { Ref, ref } from 'vue';
import { GPS_IIndexVO as gpsIIndexVO } from '../plugins-draggable-formula.api';

export interface ConditionClazz {
  id: number | null;
  judgementConditions: Ref<gpsIIndexVO[][]>;
  computationalFormulas: Ref<gpsIIndexVO[][]>;
}

export class Condition implements ConditionClazz {
  public id: number | null = null;

  // 判断条件-二维数组，兼容后续条件支持多个的情况
  public judgementConditions = ref<gpsIIndexVO[][]>([]);

  // 计算公式，兼容后续条件支持多个的情况
  public computationalFormulas = ref<gpsIIndexVO[][]>([]);

  constructor() {
    this.id = Number((Math.random() * 100000000).toFixed(0));
    this.computationalFormulas.value = [];
    this.judgementConditions.value = [];
  }
}
