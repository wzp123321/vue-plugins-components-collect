import { EDaarAbnormalTab } from '../../data-abnomal-alarm-rules.api';
export interface Daar_IAbnormalVO {
  id: null | number;
  energyCode: string;
  energyCodeName: string;
  deadbandValue: string;
  businessType: EDaarAbnormalTab;
  unit: string;
}

export interface Daar_IConvertAbnormalVO extends Daar_IAbnormalVO {
  title: string;
}

export interface Daar_IEditStore {
  column: string;
  rowIndex: number;
  originValue: string;
}
