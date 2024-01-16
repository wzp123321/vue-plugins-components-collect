// 对标详情
export const OPTIONS_BG_COLOR = 'rgb(115, 115, 115)';
export const VALUES_BG_COLOR = 'rgb(0, 178, 97)';
export const STANDARDS_BG_COLOR = 'rgb(245, 34, 45)';
export const AVERAGES_BG_COLOR = 'rgb(250, 173, 20)';
export const MINS_BG_COLOR = 'rgb(24, 144, 255)';

// 状态
export enum BENCH_STATUS {
  NODATA = -1,
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  HEIGHEST = 3,
}

// 对标详情
export enum BENCH_TYPE {
  TITLE = 'title', // 对标项
  VALUE = 'value', // 测量值
  MAX = 'max', // 最大值
  MIN = 'min', // 最小值
  AVERAGE = 'average', // 平均值
  MEDIAN = 'median', // 中位数
}
