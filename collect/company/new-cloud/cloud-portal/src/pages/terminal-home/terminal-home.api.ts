export const enum TH_ERiskRank {
  health = '边界清晰',
  warn = '有一定边界',
  danger = '无边界',
}

export interface TH_IBaseInfo {
  readonly time: Date; // 服务器时间
  readonly name: string; // 项目名称
  readonly title: string; // 标题图片地址
  readonly hostingType: string; // 托管类型
  readonly riskType: TH_ERiskRank; // 风险类型
  readonly benchmarkType: string; // 基准类型
  readonly profitType: string; // 收益类型
  readonly profitDetails: readonly string[]; // 收益分享详细内容
}

export interface TH_IModule {
  readonly tag: string; // 模块跳转标记
}
