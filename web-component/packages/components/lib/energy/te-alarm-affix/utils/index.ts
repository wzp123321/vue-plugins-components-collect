import { AlarmLevel } from '../api/index.api';

export {
  formatDateTime,
  getTimeWindow,
  type TimeWindow,
  formatDate,
} from './time';

export { comparePriority, sortByPriority, pickTopOne } from './priority';

export * from './text-filter';

/** 告警等级 → 主题色 */
export const mapAlarmThemeColorByLevel = (level: string) => {
  switch (level) {
    case AlarmLevel.CRITICAL:
      return 'var(--te-color-danger)';
    case AlarmLevel.MAJOR:
      return 'var(--te-color-warning)';
    case AlarmLevel.MINOR:
      return 'var(--te-color-data6-default)';
    case AlarmLevel.INFO:
      return 'var(--te-color-primary)';
    default:
      return 'var(--te-color-primary)';
  }
};

/** 告警等级 → te-tag type */
export const mapTagTypeByAlarmLevel = (level: string): any => {
  switch (level) {
    case AlarmLevel.CRITICAL:
      return 'danger';
    case AlarmLevel.MAJOR:
      return 'warning';
    case AlarmLevel.MINOR:
      return 'data6';
    case AlarmLevel.INFO:
      return '';
    default:
      return '';
  }
};

/** 告警等级 → 中文名 */
export const mapAlarmLevelNameByLevel = (level: string) => {
  switch (level) {
    case AlarmLevel.CRITICAL:
      return '严重';
    case AlarmLevel.MAJOR:
      return '重要';
    case AlarmLevel.MINOR:
      return '次要';
    case AlarmLevel.INFO:
      return '提示';
    default:
      return '';
  }
};

/** 告警等级 → 主题色 RGB(用于 box-shadow rgba 拼装),与 mapAlarmThemeColorByLevel 对齐 */
export const getPulseColorRgbByLevel = (level: string): string => {
  switch (level) {
    case AlarmLevel.CRITICAL:
      return '245, 34, 45'; // 红
    case AlarmLevel.MAJOR:
      return '250, 140, 22'; // 橙
    case AlarmLevel.MINOR:
      return '250, 173, 20'; // 黄(data6)
    case AlarmLevel.INFO:
      return '22, 119, 255'; // 蓝(primary)
    default:
      return '22, 119, 255';
  }
};

/** 判断 now 是否在 [start, end) 时段内(跨天用 OR);解析失败返回 false */
export const isInDndPeriod = (
  now: Date,
  start: string,
  end: string,
): boolean => {
  if (!start || !end) return false;
  const currentMinuteOfDay = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  if (Number.isNaN(startHour) || Number.isNaN(endHour)) return false;
  const startMinuteOfDay = startHour * 60 + startMinute;
  const endMinuteOfDay = endHour * 60 + endMinute;
  return startMinuteOfDay > endMinuteOfDay
    ? currentMinuteOfDay >= startMinuteOfDay ||
        currentMinuteOfDay < endMinuteOfDay
    : currentMinuteOfDay >= startMinuteOfDay &&
        currentMinuteOfDay < endMinuteOfDay;
};

export {
  TTS_NEXT_INTERVAL_MS,
  TTS_SILENT_DROP_TIMEOUT_MS,
  TTS_TEST_CONTENT,
  isSpeechSynthesisSupported,
  speakText,
  createTtsQueue,
  type TtsQueueItem,
  type TtsAlarmItem,
  type TtsSummaryItem,
  type TtsQueueCallbacks,
  type TtsQueueStartOptions,
  type TtsQueueInstance,
} from './tts';

/**
 * 格式化 badge 数量为字符串(超过 99 时显示 '99+')
 * @param count
 * @returns
 */
export const formatBadge = (count: number) =>
  count > 99 ? '99+' : String(count);
