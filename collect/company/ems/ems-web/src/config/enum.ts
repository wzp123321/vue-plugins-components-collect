// 分类分项
export enum ENERGY_CODE {
  UN_DELETE_CODE = '00000', // 不可删除code
  TOTAL_ENERGY_FLAG = 1, // 计入总能耗
}

// 树绑定
export enum TREE_BIND {
  AUTO_GENERATED = 0, // 树绑定默认值
}

// 负荷预测
export enum TIMEUNIT {
  ONE_DAY = '1d', // 1天
  ONE_MONTH = '1M', // 1月
}

// 定额配置
export enum CHOOSETIME {
  ALL = '0', // 全部
  MONTH = '1', // 月
  YEAR = '2', // 年
}

export enum CONTRASTTYPE {
  OBJECT = 1, // 多对象
  TIME = 2, // 多时间
}

// 主题模式
export enum THEME_MODE {
  LIGHT = 'light',
  DARK = 'dark',
}

// 请求状态码
export enum RESPONSE_STATUS {
  SUCCESS = 200, // 正常
  SERVER_ERROR = 500, // 服务器内部错误
  NOT_FOUND = 404, // 服务404
  PARAMS_ERROR = 400, // 传参错误
  LOGIN_STATUS_ERROR = 401, // 登录失效
  FORBIDDEN_ERROR = 403, // 权限不足
}

// 能耗异常详情结果类型
export enum ANOMALY_RESULT_TYPE {
  RESULT = 'causeSet', // 诊断结果
  TIPS = 'solutionList', // 操作建议
}

// 能耗异常类型
export enum ANOMALY_TYPE {
  BALANCE = 'balance', // 能流平衡异常
  BASIS = 'basis', // 同比异常
  CONTRAST = 'contrast', // 能耗对比异常
  CORRELATION = 'correlation', // 关联分析异常
  COST = 'cost', // 成本异常
  KPI = 'kpi', // 节能考核异常
  PEAK = 'peak', // 峰值异常
  RANK = 'rank', // 排名变化异常
  RATIO = 'ratio', // 用能异常
}

// 异常等级
export enum ANOMALY_LAVEL {
  GENERAL = 1,
  SERIOUS = 2,
}

// 对标体系
export enum BENCHMARKING_SYSTEM {
  REGION = 'region_type', // 医院所属地区
  HOSPITALLEVEL = 'hospital_level', // 医院等级
  HOSPITALTYPE = 'hospital_type', // 医院类型
  HEATINGMODE = 'heating_mode', // 供暖方式
  COOLINGMODE = 'cooling_mode', // 供冷方式
}

//   输入类型枚举
export enum INPUT_TYPES {
  SEARCH_INPUT = 'search', // 普通查询
  NUMBER_INPUT = 'number', // 纯数字
  POSITIVE_INTEGER = 'positiveNumber', // 正整数
}

// 报告报表管理
export enum REPORT_MANAGEMANT {
  REPORT_TYPE = 'report_type', // 类型
  SOURCE_TYPE = 'source_type', // 来源
}

// 告警管理
export enum ALARM_MANAGE {
  ALARM_STATUS = 'alarm_status', // 告警状态
  BUSSINESS_TYPE = 'business_type', // 业务分类
  ALARM_LEVEL = 'alarm_level', // 告警等级
}

// 能耗分析---指标未配置
export enum VALUE_MEAN_UNCONFIGURE {
  PER_CAPITA = 1700, // 人均未配置
  UNIT_AREA = 1701, // 单位面积
}

// 时间颗粒度
export enum TIME_UNITS {
  MINUTES = '10m', // 十分钟
  HOUR = '1h', // 1小时
  DAY = '1d', // 天
  MONTH = '1M', // 月
  YEAR = '1y',
}

// 快捷选时
export enum Common_EQuickTimingType {
  今日 = 'today',
  昨天 = 'yesterday',
  本周 = 'week',
  上周 = 'lastWeek',
  本月 = 'month',
  上月 = 'lastMonth',
}

//定额状态
export enum Eca_EWarningStatus {
  盈余 = '1',
  警告 = '2',
  超标 = '3',
}
