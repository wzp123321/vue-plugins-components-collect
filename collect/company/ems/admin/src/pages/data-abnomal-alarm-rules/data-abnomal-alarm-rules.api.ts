// 异常tab
export enum EDaarAbnormalTab {
  实时异常 = 1,
  边界异常,
  昨日异常,
}

export enum EDaarAbnormalType {
  能流平衡异常 = 1,
  用能异常 = 2,
  排名变化 = 3,
  关联分析异常 = 4,
  峰值时间异常 = 5,
  节能考核异常 = 6,
  能耗对比异常 = 8,
  成本异常 = 9,
  边界异常 = 10,
}

export enum EDaarThresholdType {
  用能增长 = '1',
  用能下降 = '2',
  边界异常 = '13',
}
// 查询日志地址
export enum EDaarLogType {
  查询能耗分析异常配置日志 = '/admin/alarm/energy/analyse/config/query/logs',
  查询昨日异常配置日志 = '/admin/abnormal/threshold/config/query/logs',
  查询实时异常配置日志 = '/admin/abnormal/queryLimitThresholdLogs',
}

// 告警等级
export enum EDaarAlarmLevel {
  严重 = 'serious',
  重要 = 'important',
  次要 = 'secondary',
  提示 = 'info',
}

// tab切换
export enum EDaarPageModule {
  能耗分析 = 'energyAnalysis',
  实时异常 = 'realTimeAbnormal',
  昨日异常 = 'yesterdayAbnormal',
  边界异常 = 'boundaryAbnormal',
}
