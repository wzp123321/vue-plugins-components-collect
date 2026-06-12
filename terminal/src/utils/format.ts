/**
 * 数字/时间格式化
 */

/** 数字千分位分隔 */
export const formatNumber = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 保留 n 位小数（默认 1） */
export const toFixed = (n: number, d = 1): string => {
  if (Number.isNaN(n)) return '--';
  return n.toFixed(d);
};

/** 当前时间 HH:MM:SS */
export const formatNow = (): string => {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/** 当前日期 YYYY-MM-DD 周X */
export const formatDate = (): string => {
  const d = new Date();
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 周${weeks[d.getDay()]}`;
};
