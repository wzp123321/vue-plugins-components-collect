/**
 * 告警/事件过滤条件 hook(纯事件驱动)
 * 容器在 onOpen / onTabChange / onConfigSaved 中调 reset()
 */
import { ref, type Ref } from 'vue';
import {
  type AlarmNoticeConfigVO,
  AlarmLevel,
  type AlarmFilters,
} from '../api/index.api';
import { getTimeWindow } from '../utils';
import { BADGE_WINDOW_MS } from '../constant';

export interface UseAlarmFiltersOptions {
  spaceCodeList: string[];
}

export interface UseAlarmFiltersReturn {
  filters: Ref<AlarmFilters>;
  resetFilters: () => void;
}

/**
 * 从 DTO.subscribeAlarmLevelList 中提取已订阅告警等级（selected=true）
 */
const getSubscribedAlarmLevels = (config: AlarmNoticeConfigVO): AlarmLevel[] =>
  (config.subscribeAlarmLevelList ?? [])
    .filter((item) => item.selected)
    .map((item) => item.code as AlarmLevel);

/**
 * 从 DTO.subscribeSystemList 提取已订阅专业模块(selected=true)
 * id: 后端字符串 id 转为 number(无效值会得到 NaN,由调用方按需过滤)
 */
const getSubscribedProfessionalModules = (
  config: AlarmNoticeConfigVO,
): { id: string; name: string }[] =>
  (config.subscribeSystemList ?? [])
    .filter((item) => item.selected)
    .map((item) => ({ id: item.id, name: item.name }));

export const useAlarmFilters = (
  config: Ref<AlarmNoticeConfigVO>,
  options: UseAlarmFiltersOptions,
): UseAlarmFiltersReturn => {
  const { spaceCodeList } = options;

  const defaultFilters = (): AlarmFilters => ({
    spaceCodeList: [...(spaceCodeList ?? [])],
    alarmLevelList: getSubscribedAlarmLevels(config.value),
    systemIdList: getSubscribedProfessionalModules(config.value).map(
      (m) => m.id,
    ),
    operationStatus: '',
    status: '',
    keyword: '',
    startTime: getTimeWindow(BADGE_WINDOW_MS).startTime,
    endTime: getTimeWindow(BADGE_WINDOW_MS).endTime,
  });

  const filters = ref<AlarmFilters>(defaultFilters());

  /**
   * 重置过滤条件
   */
  const resetFilters = () => {
    filters.value.spaceCodeList = options.spaceCodeList ?? [];
    filters.value.alarmLevelList = getSubscribedAlarmLevels(config.value);
    filters.value.systemIdList = getSubscribedProfessionalModules(
      config.value,
    ).map((m) => m.id);
    filters.value.operationStatus = '';
    filters.value.status = '';
    filters.value.keyword = '';
    const { startTime, endTime } = getTimeWindow(BADGE_WINDOW_MS);
    filters.value.startTime = startTime;
    filters.value.endTime = endTime;
  };

  return { filters, resetFilters };
};
