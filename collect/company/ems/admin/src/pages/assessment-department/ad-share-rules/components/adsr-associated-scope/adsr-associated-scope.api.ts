export enum ADBIM_ESTATE {
  未使用 = '0',
  已使用 = '1',
}

export interface ADSR_IAssociateScopeVO {
  fixed: string;
  id: string;
  name: string;
  scopeType: string;
  scopeTypeText: string;
  serialNumber: string;
  used: string;
  treeInfo?: ADSR_ITreeVO[];
}

export interface ADSR_IAssociateScopeDetail {
  fixed: string;
  id: string;
  name: string;
  scopeType: string;
  scopeTypeText: string;
  serialNumber: string;
  used: string;
  treeInfo?: ADSR_ITreeVO[];
  treeIds?: string[];
  treeNames?: string[];
}

export interface ADSR_ITreeVO {
  clickStatus: string;
  id: string;
  treeLevel: string;
  treeName: string;
  childTree?: ADSR_ITreeVO[];
}

export enum ADSR_FIXED_TYPE {
  非系统 = 0,
  系统内置 = 1,
}
