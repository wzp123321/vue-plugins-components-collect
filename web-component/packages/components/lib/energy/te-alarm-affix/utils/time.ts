import moment from 'moment';

/** 补零到两位 */
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Date → 'YYYY-MM-DD HH:mm:ss'(本地时区) */
export const formatDateTime = (date: Date): string => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

export interface TimeWindow {
  /** 起始时间(含) */
  startTime: string;
  /** 结束时间(含) */
  endTime: string;
}

/** 生成"过去 durationMs 到 now"的时间窗 */
export const getTimeWindow = (
  durationMs: number,
  now: Date = new Date(),
): TimeWindow => {
  const start = new Date(now.getTime() - durationMs);
  return {
    startTime: formatDateTime(start),
    endTime: formatDateTime(now),
  };
};

/**
 * 任务节点创建时间格式化
 * @param time 创建时间
 */
export const formatDate = (time?: number, format = 'YYYY-MM-DD HH:mm:ss') => {
  return time ? moment(time).format(format) : '';
};
