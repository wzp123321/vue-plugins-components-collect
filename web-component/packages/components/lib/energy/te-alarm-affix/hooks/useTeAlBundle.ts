/**
 * TeAl 服务装配(Bundle Hook)
 *
 * 容器(TeAlarmAffix / HomeRealtimeAlarmNew)只调一次 useTeAlBundle
 * 拿到完整 services 闭包,provide 到子树供 inject 解构
 */
import type { AxiosInstance } from 'axios';
import { computed, ref } from 'vue';
import type { ComputedRef } from 'vue';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import { getTimeWindow } from '../utils/time';
import { useAlarmConfig } from './useAlarmConfig';
import type { UseAlarmConfigReturn } from './useAlarmConfig';
import { useAlarmNotification } from './useAlarmNotification';
import type { UseAlarmNotificationReturn } from './useAlarmNotification';
import { useAlarmSound } from './useAlarmSound';
import type { UseAlarmSoundReturn } from './useAlarmSound';
import { useAlarmStats } from './useAlarmStats';
import type { UseAlarmStatsReturn } from './useAlarmStats';
import type { AppSystemCode } from '../api/index.api';
import { BADGE_WINDOW_MS } from '../constant';

export interface UseTeAlBundleOptions {
  /** axios 实例(业务系统传入) */
  axiosInstance: AxiosInstance;
  /** 当前 systemCode,如 'IMS' */
  systemCode: AppSystemCode;
  /** 当前所选院区 id 列表(响应式);undefined 内部 ?? [] 兜底 */
  spaceCodeList: string[];
}

export interface TeAlServices {
  axiosInstance: AxiosInstance;
  systemCode: AppSystemCode;
  /** 当前所选院区 id 列表(响应式;undefined 兜底成 []) */
  spaceCodeList: string[];
  config: UseAlarmConfigReturn;
  notification: UseAlarmNotificationReturn;
  sound: UseAlarmSoundReturn;
  stats: UseAlarmStatsReturn;
  /** 告警 tab 角标(由 fetchAlarmEventCount 写入 alarmCount) */
  alarmTotal: ComputedRef<number>;
  /** 事件 tab 角标(由 fetchAlarmEventCount 写入 eventCount) */
  eventTotal: ComputedRef<number>;
  /** 悬浮框 badge(24h 合并 = alarmCount + eventTotal,来自 useAlarmStats) */
  badgeTotal: ComputedRef<number>;
  /** tab 角标(alarmTotal / eventTotal)+ 悬浮框 badge(badgeTotal)同步入口 */
  fetchAlarmEventCount: () => Promise<void>;
}

export const useTeAlBundle = (options: UseTeAlBundleOptions): TeAlServices => {
  const { axiosInstance, systemCode, spaceCodeList } = options;

  // config 必须先建,notification / sound 都从它取 deps
  const config = useAlarmConfig(axiosInstance);
  const notification = useAlarmNotification();
  const sound = useAlarmSound({
    config: config.alarmConfigData,
    isDndActive: config.isDndActive,
    isSoundEnabledFor: config.isSoundEnabledFor,
  });
  // 24h 合并 badge
  const stats = useAlarmStats();

  // tab 角标 state(useAlarmTableData 写入最近一次分页 total)
  const alarmTotalRef = ref(0);
  const eventTotalRef = ref(0);

  /**
   * 拉 1 次 24h 告警/事件未确认数 → 同步写入 alarmTotal / eventTotal / badgeTotal
   * - 数据源:POST /alarm/queryCurrentAlarmAndEventCount
   * - 写入策略(覆盖):alarmTotal = res.data.alarmCount, eventTotal = res.data.eventCount, badgeTotal = sum
   * - 失败 / 空返回 → 不写,保留上次值(避免误清零)
   * - 调用时机:
   *   - 容器 init 阶段调 1 次(设 baseline)
   *   - useAlarmPolling 5s 轮询调 1 次(覆盖)
   *   - useAlarmTableData 50s 表格轮询调 1 次(覆盖)
   */
  const fetchAlarmEventCount = async (): Promise<void> => {
    try {
      const window = getTimeWindow(BADGE_WINDOW_MS);
      const res = await TeAlarmAffixApi.queryCurrentAlarmAndEventCount(
        axiosInstance,
        {
          startTime: window.startTime,
          endTime: window.endTime,
          spaceCodeList,
        },
      );
      const data = res?.data;
      if (!data) {
        console.warn(
          '[useTeAlBundle] fetchAlarmEventCount 后端返回为空,保留上次值',
        );
        return;
      }
      const alarmCount = data.alarmCount ?? 0;
      const eventCount = data.eventCount ?? 0;
      alarmTotalRef.value = alarmCount;
      eventTotalRef.value = eventCount;
      stats.setTotal(alarmCount + eventCount);
      // 同步悬浮图标等级（初始化 / 轮询保底 / Toast 结束共用）
      notification.syncLatestAlarmLevel(data.maxAlarmLevel);
      console.log(
        '[useTeAlBundle] fetchAlarmEventCount 完成, alarmCount=',
        alarmCount,
        ', eventCount=',
        eventCount,
        ', badgeTotal=',
        alarmCount + eventCount,
      );
    } catch (err) {
      console.warn(
        '[useTeAlBundle] fetchAlarmEventCount 失败,保留上次值, err=',
        err instanceof Error ? err.message : err,
      );
    }
  };

  return {
    axiosInstance,
    systemCode,
    spaceCodeList,
    config,
    notification,
    sound,
    stats,
    alarmTotal: computed(() => alarmTotalRef.value),
    eventTotal: computed(() => eventTotalRef.value),
    badgeTotal: computed(() => stats.totalCount.value),
    fetchAlarmEventCount,
  };
};

/**
 * 给 useAlarmPolling 用的 deps 工厂
 *
 * bundle 持有 notification / sound / stats,但 polling 由容器按需创建
 * (多实例隔离:每个容器自己一份 polling 状态)
 */
export const buildPollingDeps = (services: TeAlServices) => ({
  axiosInstance: services.axiosInstance,
  systemCode: services.systemCode,
  spaceCodeList: services.spaceCodeList,
  configService: services.config,
  notification: services.notification,
  sound: services.sound,
  stats: services.stats,
  fetchAlarmEventCount: services.fetchAlarmEventCount,
  notificationDeps: {
    config: services.config.alarmConfigData,
    isDndActive: services.config.isDndActive,
  },
  soundDeps: {
    config: services.config.alarmConfigData,
    isDndActive: services.config.isDndActive,
    isSoundEnabledFor: services.config.isSoundEnabledFor,
  },
});
