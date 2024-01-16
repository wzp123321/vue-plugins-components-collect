import { PM_IContractNodePeriod } from '../../pm-add-editor.api';

export interface PIC_IIncomeCalculationVO extends PM_IContractNodePeriod {
  nodeDivisionName: string;
  affiliationFlag: boolean;
}
