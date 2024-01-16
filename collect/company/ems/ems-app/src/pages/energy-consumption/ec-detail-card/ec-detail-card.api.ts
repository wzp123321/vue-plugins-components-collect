import type { Ec_INodeItem } from '../energy-consumption.api';

export interface Ecs_IDetailItem extends Ec_INodeItem {
  show: boolean;
  labelShow: boolean;
  name: string;
  value: number;
}

//图例
export interface Ecs_ILegendDataItem {
  show: boolean;
  labelShow: boolean;
  name: string;
  value: number;
}
