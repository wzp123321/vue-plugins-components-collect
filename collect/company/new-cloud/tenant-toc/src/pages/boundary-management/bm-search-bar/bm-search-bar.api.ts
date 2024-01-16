import { BM_EMeasureType, BM_EVerificationType, BM_IQueryByConditionReqParams } from '../boundary-management.api';
import { CommonICodeName } from '@/service/api';

/**
 * 查询表单
 */
export interface BM_IAddManagementForm
  extends Omit<BM_IQueryByConditionReqParams, 'hostingPeriod' | 'tenantId' | 'tenantCode'> {
  /**
   * 托管期
   */
  hostingPeriod: number | null;
  startTime: string;
  endTime: string;
}
// 核定类型列表
export const mapVerificationTypeList = (): CommonICodeName<string>[] =>
  Object.entries(BM_EVerificationType).map(([k, v]) => {
    return {
      code: v + '',
      name: k,
    };
  });
// 计量类型列表
export const mapMeasureTypeList = (): CommonICodeName<string>[] =>
  Object.entries(BM_EMeasureType).map(([k, v]) => {
    return {
      code: v + '',
      name: k,
    };
  });
// 托管期
export interface BmSbIHostPeriodVO {
  code: number;
  name: string;
  status: boolean;
  months: number;
  start: BmSbITimeVO;
  end: BmSbITimeVO;
}

export interface BmSbITimeVO {
  monthOfYear: 7;
  year: 2023;
}
