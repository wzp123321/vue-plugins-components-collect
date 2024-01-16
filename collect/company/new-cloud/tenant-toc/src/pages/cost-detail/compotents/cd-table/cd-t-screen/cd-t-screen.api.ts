import { FGetCookie } from '@/core/token';

export const SCREEN_STORAGE_KEY = `cost-detail-screen-map-${FGetCookie('toc_tenant_id')}`;

export interface CD_TS_ICodeName {
  code: string;
  name: string;
}

export interface CD_TS_SelectVO {
  isActive: boolean;
  checked: boolean;
  indeterminate: boolean;
  checkList: string[];
  dataSource: string[];
}

export interface CD_TS_QueryParams {
  queryChoice: {
    [key: string]: number;
  };
  otherChoice: {
    amount?: string[];
    balance?: string[];
    billCode?: string[];
    billDate?: string[];
    billMonth?: string[];
    billProjectContent?: string[];
    billTitleContent?: string[];
    billTypeName?: string[];
    billYear?: string[];
    costNode?: string[];
    costType?: string[];
    employeeCode?: string[];
    employeeDepartment?: string[];
    employeeName?: string[];
    employeeType?: string[];
    ledgerCode?: string[];
    ledgerName?: string[];
    productCode?: string[];
    productName?: string[];
    productType?: string[];
    productTypeName?: string[];
    projectNumber?: string[];
    projectTaskName?: string[];
    recordTime?: string[];
  };
}
