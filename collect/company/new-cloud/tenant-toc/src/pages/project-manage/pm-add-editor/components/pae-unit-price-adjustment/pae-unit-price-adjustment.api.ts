import { PM_IContractPriceAdjust } from '../../pm-add-editor.api';

// 单价调差方式
export interface Pupa_IEnergyPriceAdjustmentVO extends PM_IContractPriceAdjust {
  // 能源类型
  energyName: string;
}
