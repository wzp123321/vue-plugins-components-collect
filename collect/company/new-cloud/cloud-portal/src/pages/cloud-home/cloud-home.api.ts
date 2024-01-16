export const enum CH_EWeather {
  未知,
  多云,
  雾,
  冰雹,
  小雨,
  中雨,
  阴,
  雨夹雪,
  雪,
  晴,
  雷阵雨,
}

export enum CH_EWeek {
  星期日,
  星期一,
  星期二,
  星期三,
  星期四,
  星期五,
  星期六,
}

export enum CH_EProjectState {
  全部,
  已签约未进场,
  建设期,
  运营期,
}

export enum CH_EProfitState {
  亏损 = 1,
  低盈利,
  中盈利,
  高盈利,
}

export interface CH_IBaseInfo {
  readonly time: Date; // 服务器时间
  readonly weather: CH_EWeather; // 服务器所在地天气
}

export interface CH_IProjectStatistic {
  readonly state: CH_EProjectState; // 项目状态 0-全部 1-已签约未进场 2-建设期 3-运营期
  readonly count: number; // 项目数量
}

export interface CH_IProjectInfo {
  readonly id: string;
  readonly code: string;
  readonly tag?: string; // 能源事件跳转标记
  readonly name: string; // 项目名称
  readonly coordinate: [number | undefined, number | undefined]; // 坐标
  readonly alarm: boolean; // 新能源事件告警
  readonly state: CH_EProjectState; // 盈利情况 1-亏损 2-低盈利 3-中盈利 4-高盈利
  readonly profitState: CH_EProfitState; // 项目状态 1-已签约未进场 2-建设期 3-运营期
  readonly start: string; // 托管开始时间
  readonly end: string; // 托管结束时间
  readonly manager: string; // 能源经理
  readonly surplus: { value: number; unit: string }; // 盈余
  readonly clickFlag: boolean; // 跳转权限
}
