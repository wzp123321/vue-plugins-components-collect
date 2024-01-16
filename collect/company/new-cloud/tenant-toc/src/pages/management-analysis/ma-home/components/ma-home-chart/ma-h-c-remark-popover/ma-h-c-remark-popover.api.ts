import { MA_HOME_EDateType } from '../../../services/api';

export interface RemarkOptions {
  nodeId: string;
  top: string;
  left: string;
  direction: string;
}

export interface AddRemarkParams {
  nodeId: string;
  operateName: string;
  operateTime: number;
  remarks: string;
  tenantCode: string;
  tenantId: number;

  queryType: number;
  durationType?: MA_HOME_EDateType;
  year?: number;
  month?: number;
}

export interface RpResultVO {
  remark: string;
  operateName: string;
}

export interface MA_H_C_SearchParams {
  queryType: number;
  durationType?: MA_HOME_EDateType;
  startDate?: string;
  endDate?: string;
}

export const unRemarkStyle = {
  backgroundColor: '#fff',
  width: '119px',
};

export const remarkStyle = {
  backgroundColor: '#fffcea',
  width: '140px',
  height: '140px',
};

export enum RemarkStatus {
  待插入 = 0,
  已插入 = 1,
  插入中 = 2,
  查看中 = 3,
}
