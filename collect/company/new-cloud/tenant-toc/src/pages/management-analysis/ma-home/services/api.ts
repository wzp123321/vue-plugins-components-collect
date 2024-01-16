export const enum MA_HOME_ERiskRank {
  health = '边界清晰',
  warn = '有一定边界',
  danger = '无边界',
}

export const enum MA_HOME_ENodeType {
  主节点,
  收入,
  成本,
}

export const enum MA_HOME_EPopupType {
  默认,
  主节点,
  节能项,
  实缴,
}

export enum MA_HOME_EDateType {
  按年 = 1,
  按月,
  累计,
}

export enum MA_HOME_EQueryType {
  运营期 = 2,
  建设期 = 1,
  实验局 = 5,
  '历史累计（不含实验局）' = 4,
  历史累计 = 3,
}

export interface MA_HOME_IBaseInfo {
  readonly time: Date; // 服务器时间
  readonly name: string; // 项目名称
  readonly start: Date; // 项目起始日期
  readonly end: Date; // 项目截至日期
  readonly hostingType: string; // 托管类型
  readonly riskType: MA_HOME_ERiskRank; // 风险类型
  readonly benchmarkType: string; // 基准类型
  readonly profitType: string; // 收益类型
  readonly profitDetails: readonly string[]; // 收益分享详细内容
}

export interface MA_HOME_IBrainMapNode {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly unit: string;
  readonly remark: string;
  readonly operateName: string;
  readonly position?: 'left' | 'right';
  readonly isDeduction: boolean;
  readonly extensions: MA_HOME_INodeExtensionItem[];
  readonly energyCode?: string;
  readonly popup: MA_HOME_EPopupType;
  readonly children: MA_HOME_IBrainMapNode[];
}

export interface MA_HOME_INodeExtensionItem {
  readonly code: string;
  readonly name: string;
  order?: number;
  readonly value?: string;
  readonly unit?: string;
  readonly color?: string;
  visible?: boolean;
}

export interface MA_HOME_DATE_SCOPE {
  time?: number;
  startTime?: number;
  endTime?: number;
}

// 租户信息
export const TOKEN: Readonly<{ tenantCode: string; tenantId: number }> = {
  tenantCode: sessionStorage.getItem('TENANT_CODE') || 'test03',
  tenantId: +(sessionStorage.getItem('TENANT_ID') || 13232244),
};
Object.freeze(TOKEN);

export interface IRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

export function FResHandler<T = void>(res: IRes<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}
