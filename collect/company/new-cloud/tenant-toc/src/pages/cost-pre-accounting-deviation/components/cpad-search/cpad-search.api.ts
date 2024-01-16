export interface CPAD_QueryParams {
  /**
   * 时间维度
   */
  type?: CPAD_EDateType;
  /**
   * 查询年
   */
  startTime?: string | null;
  /**
   * 查询月
   */
  endTime?: string | null;
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
}

export interface CPAD_SearchClick extends CPAD_QueryParams {
  clickTriggle?: boolean;
}

/**
 * 托管期
 */
export interface CPAD_IDuraionData {
  code: number;
  name: string;
  months: number;
  status: boolean;
  start: {
    year: number; //起始年
    monthOfYear: number; //起始月
    dayOfMonth: number; //起始日期
  };
  end: {
    year: number; //截止年
    monthOfYear: number; //截止月
    dayOfMonth: number; //截止日期
  };
}

/**
 * 时间范围
 */
export interface CPAD_IDateScope {
  time?: number;
  startTime?: number;
  endTime?: number;
}

export enum CPAD_EDateType {
  按年 = 1,
  按月 = 2,
  累计 = 3,
}

export enum EPath {
  查询时间选择范围 = '/costAccounting/queryPeriod',
}
