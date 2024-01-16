import {
  BM_IAddManagementParams,
  BM_IEditManagementParams,
  BM_IEnergyAreaVO,
  BM_IHostingAreaVO,
} from '../boundary-management.api';
// 边界类型
export enum BM_EBoundaryType {
  能源单价调整 = '1',
  用能设备及器具调整 = '2',
  业务面积或业务用途调整 = '3',
  工程施工用能 = '4',
  第三方经营业务服务范围扩大 = '5',
  医院综合业务量变化 = '6',
  兜底条款 = '7',
}
/**
 * 新增、编辑表单
 */
export interface BM_IAddEditForm
  extends Omit<BM_IEditManagementParams, 'eventId' | 'tenantId' | 'tenantCode' | 'energyCodeAreas'>,
    Omit<BM_IAddManagementParams, 'hostingPeriod' | 'tenantId' | 'tenantCode' | 'energyCodeAreas'> {
  eventId: number | null;
  hostingPeriod: number | null;
  energyCodeAreas: BM_IConvertEnergyAreaVO[];
}

export interface BM_IConvertEnergyAreaVO extends BM_IEnergyAreaVO {
  energyCodeName: string;
  hasHostingRegion: boolean;
  energySelected: boolean;
  hostingAreas: BM_IHostingAreaVO[];
}

export interface BM_IAddEditDetail {
  boundaryType: string;
  comment: string;
  deviceType: string;
  eventName: string;
  measureType: string;
  tenantId: number;
  verificationType: string;
  eventId: number | null;
  hostingPeriod: number | null;
  energyHostingAreas: BM_IConvertEnergyAreas[];
}

interface BM_IConvertEnergyAreas {
  energyCode: string;
  energyName: string;
  energySelected: boolean;
  hostingAreaIds: number[];
}
// 处理弹框打开入参
export interface BmIHandleShowParams {
  id?: number | null;
  boundaryType?: number | null;
  hostingPeriod?: number | null;
  chainId?: number | null;
}
