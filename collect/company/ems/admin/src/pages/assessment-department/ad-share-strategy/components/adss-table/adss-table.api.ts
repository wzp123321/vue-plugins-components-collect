import { SourceItem } from '../adss-add/adss-add.api';

/**
 * 查询入参
 */
export interface At_ITableParams {
  orders: {
    asc: boolean;
    column: string;
  }[];
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
  likeName: string; // 策略名称
  energyType: string; // 能源类型
  startDate: string;
  endDate: string;
}
export interface At_ITableItem {
  apportionedEndTime: string;
  apportionedName: string;
  apportionedObject: string;
  apportionedObjectList: { id: string; name: string }[];
  apportionedObjectName: string;
  apportionedObjectType: string;
  apportionedRule: string;
  apportionedRuleId: string;
  apportionedSource: string;
  apportionedSources: SourceItem[];
  apportionedStartTime: string;
  energyCode: string;
  energyName: string;
  id: number;
}

export interface At_ITableItemVO {
  apportionedEndTime: string;
  apportionedName: string;
  apportionedObject: string;
  apportionedObjectList: { id: string; name: string }[];
  apportionedObjectName: string;
  apportionedObjectType: string;
  apportionedRule: string;
  apportionedRuleId: string;
  apportionedSource: string;
  apportionedSourceList: SourceItem[];
  apportionedStartTime: string;
  energyCode: string;
  energyName: string;
  id: number;
}
