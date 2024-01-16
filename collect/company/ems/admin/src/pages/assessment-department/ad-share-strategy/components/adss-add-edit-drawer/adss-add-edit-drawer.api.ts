import { At_ITableItem } from '../adss-table/adss-table.api';

export interface Aaed_IForm extends Omit<At_ITableItem, 'apportionedStartTime' | 'apportionedEndTime'| 'id'> {
  apportionDates: Date[][];
  id: number | null
}
