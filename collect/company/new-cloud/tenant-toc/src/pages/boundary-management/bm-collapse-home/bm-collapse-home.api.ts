import { BM_IEventTableListVO } from '../boundary-management.api';

export const BM_HEADER_NAME = '能源类型';

export const BM_BOUNDARY_EVENT_SESSION_KEY = 'bm_boundary_event';

export interface BM_IBoundaryTypeDataVO {
  boundaryTypeName: string;
  persistentType: string;
  boundaryTypeId: number;
  activeEventIndex: number;
  tableData: BM_IConvertEventTableListVO[];
}

export type BM_IConvertEventTableListVO = BM_IEventTableListVO & {
  headerColSpan: number;
};

// 单元格编辑
export interface BM_IBoundaryTdEditStore {
  // 能源类型
  energyCode: string;
  // 边界类型
  boundaryTypeId: number | null;
  // 事件id
  eventId: number | null;
  // 年
  year: string;
  // 月
  month: string;
  // 值
  amount: number | null;
  // 事件类型
  persistentType: string;
  // 托管区域
  hostingAreaId: number | null;
  // 旧值
  originValue: string;
  // 修改项类型，用量&单价
  itemName: string;
}
