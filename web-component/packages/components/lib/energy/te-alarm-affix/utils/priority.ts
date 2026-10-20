/**
 * 告警/事件优先级工具
 *
 * 规则:1) 告警 > 事件  2) 严重 > 重要 > 次要 > 提示  3) 同级按 generationTime 倒序
 */
import { AlarmType, type AlarmNotifyItem } from '../api/index.api';
import { LEVEL_RANK } from '../constant';

/**
 * 比较两个告警/事件的优先级:> 0 表示 a 优先级更高
 * @param a 告警/事件 a
 * @param b 告警/事件 b
 * @returns
 */
export const comparePriority = (
  a: AlarmNotifyItem,
  b: AlarmNotifyItem,
): number => {
  // 1. 告警 > 事件
  if (a.alarmEventType !== b.alarmEventType) {
    return a.alarmEventType === AlarmType.ALARM ? 1 : -1;
  }
  // 2. 同类型按等级
  const rankDiff =
    (LEVEL_RANK as any)[b.levelCode] - (LEVEL_RANK as any)[a.levelCode];
  if (rankDiff !== 0) return rankDiff;
  // 3. 同级按 generationTime 倒序
  return b.generationTime.localeCompare(a.generationTime);
};

/**
 * 按"等级"比较两个告警/事件(不含时间,用于 setLatestAlarm / 替换判定)
 * - 告警(2) > 事件(1)
 * - 同类型内按 LEVEL_RANK 比较
 * - 同级返回 0
 * @returns > 0 表示 a 等级更高; = 0 表示同等级; < 0 表示 a 等级更低
 */
export const compareLevelOnly = (
  a: AlarmNotifyItem,
  b: AlarmNotifyItem,
): number => {
  // 1. 告警 > 事件
  if (a.alarmEventType !== b.alarmEventType) {
    return a.alarmEventType === AlarmType.ALARM ? 1 : -1;
  }
  // 2. 同类型按 LEVEL_RANK
  const rankA = (LEVEL_RANK as any)[a.levelCode] ?? 0;
  const rankB = (LEVEL_RANK as any)[b.levelCode] ?? 0;
  return rankA - rankB;
};

/**
 * 按优先级降序排序(top1 在 [0]),不修改入参,返回新数组
 * @param alerts 告警/事件数组
 * @returns
 */
export const sortByPriority = (alerts: AlarmNotifyItem[]): AlarmNotifyItem[] =>
  [...alerts].sort(comparePriority);

/**
 * 取 top1 告警(空数组返回 null)
 * @param alerts 告警/事件数组
 * @returns
 */
export const pickTopOne = (
  alerts: AlarmNotifyItem[],
): AlarmNotifyItem | null => {
  if (!alerts || alerts.length === 0) return null;
  return sortByPriority(alerts)[0];
};
