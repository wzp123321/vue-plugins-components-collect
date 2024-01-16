import type { Ec_INodeItem } from '../energy-consumption.api';

/*
 * @Author: yut
 * @Date: 2023-11-04 10:52:13
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-11 19:07:16
 * @Descripttion:
 */
export interface ICard_DataItem extends Ec_INodeItem {
  loading: boolean;
  customId: string;
  children: ICard_DataItem[];
}
