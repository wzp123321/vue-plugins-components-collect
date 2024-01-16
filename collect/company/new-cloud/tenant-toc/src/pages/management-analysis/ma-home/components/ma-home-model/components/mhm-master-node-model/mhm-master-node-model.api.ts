export interface MHM_NodeInfo {
  startTime: Date;
  endTime?: Date;
  nodeId: number;
}
export interface MHM_MasterParamType {
  nodeId: number;
  tenantCode: string;
  tenantId: number;
  year: number;
}

export interface MHM_MasterDataType {
  code: number;
  message: string;
  data: MHM_MasterInfoType[];
}

export interface MHM_MasterInfoType {
  month: number;
  date: string | null;
  value: string | null;
  unit: string | null;
  status?: string;
  maxOrMinStatus: string | null;
}

export interface CH_IBaseInfo {
  readonly time: Date; // 服务器时间
  // readonly weather: CH_EWeather; // 服务器所在地天气
}

export interface MHM_MasterInfoDate {
  timestamp: number;
}

export const MHM_NodeDataList: MHM_MasterInfoType[] = [
  {
    month: 1,
    date: null,
    value: '29.178',
    unit: '万元',
    status: '1',
    maxOrMinStatus: '1',
  },
  {
    month: 2,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 3,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 4,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 5,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 6,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 7,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 8,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 9,
    date: null,
    value: '-99.78',
    unit: '万元',
    status: '2',
    maxOrMinStatus: '2',
  },
  {
    month: 10,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 11,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
  {
    month: 12,
    date: null,
    value: null,
    unit: null,
    status: '0',
    maxOrMinStatus: null,
  },
];

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
