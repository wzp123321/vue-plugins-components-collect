export interface ADBIM_IBasicIndicatorVO {
  id: string;
  effectiveStartTime: string;
  effectiveEndTime: string;
  mark: string;
}

export interface ADBIM_IBIForm {
  id: string;
  effectiveStartTime: Date | null;
  effectiveEndTime: Date | null;
  mark: string;
}

export interface ADBIM_IBasicIndicatorQueryParams {
  pageNum: number;
  pageSize: number;
}
