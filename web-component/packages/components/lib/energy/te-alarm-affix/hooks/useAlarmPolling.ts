/**
 * 新告警轮询 hook(闭包 state,无单例)
 *
 * 职责:5s 拉取 + 订阅过滤 + Toast/TTS 6 分支编排
 * 6 分支规则见 dispatch()
 * 通知框去重已取消(后端保证 5s 窗口内 id 唯一,前端不再用 notifiedIds 集合过滤)
 */
import { computed, onUnmounted, ref } from 'vue';
import type { ComputedRef } from 'vue';
import type { AxiosInstance } from 'axios';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import { ALARM_POLL_INTERVAL } from '../constant';
import { getTimeWindow } from '../utils/time';
import {
  pickTopOne,
  sortByPriority,
  compareLevelOnly,
} from '../utils/priority';
import {
  SwitchFlag,
  type AlarmNotifyItem,
  type AppSystemCode,
} from '../api/index.api';
import type { UseAlarmStatsReturn } from './useAlarmStats';
import type {
  UseAlarmNotificationDeps,
  UseAlarmNotificationReturn,
} from './useAlarmNotification';
import type { UseAlarmSoundDeps, UseAlarmSoundReturn } from './useAlarmSound';
import type { UseAlarmConfigReturn } from './useAlarmConfig';
import type { TtsQueueCallbacks } from '../utils/tts';

const LOG_TAG = '[useAlarmPolling][pollOnce]';
const LOG_ID_LIMIT = 5;

export interface UseAlarmPollingOptions {
  onAutoOpenDialog?: (alarms: AlarmNotifyItem[]) => void;
}

export interface UseAlarmPollingDeps {
  axiosInstance: AxiosInstance;
  systemCode: AppSystemCode;
  /** 当前所选院区 id 列表(响应式) */
  spaceCodeList: string[];
  configService: UseAlarmConfigReturn;
  notification: UseAlarmNotificationReturn;
  sound: UseAlarmSoundReturn;
  stats: UseAlarmStatsReturn;
  /** 拉 1 次 24h 告警/事件未确认数,覆盖 alarmTotal / eventTotal / badgeTotal(失败保留上次值) */
  fetchAlarmEventCount: () => Promise<void>;
  /** 透传给 notification / sound 的子依赖,本 hook 不直接消费 */
  notificationDeps: UseAlarmNotificationDeps;
  soundDeps: UseAlarmSoundDeps;
}

export interface UseAlarmPollingReturn {
  start: () => void;
  stop: () => void;
  isPolling: ComputedRef<boolean>;
}

export const useAlarmPolling = (
  deps: UseAlarmPollingDeps,
  options?: UseAlarmPollingOptions,
): UseAlarmPollingReturn => {
  const {
    axiosInstance,
    systemCode,
    spaceCodeList,
    configService,
    notification,
    sound,
    stats,
    fetchAlarmEventCount,
  } = deps;
  const { alarmConfigData, isDndActive, isSystemInScope } = configService;

  // ============ 闭包 state ============
  const isPolling = ref(false);
  let pollTimer: number | null = null;

  /**
   * 启动轮询
   * @param cb 轮询回调,入参无,出参无
   * @param interval 轮询间隔(ms interval)
   * @returns
   */
  const startPolling = (cb: () => Promise<void> | void, interval: number) => {
    if (pollTimer !== null) {
      console.warn(`${LOG_TAG} startPolling: 已在轮询中,忽略重复调用`);
      return;
    }
    isPolling.value = true;
    pollTimer = window.setInterval(() => {
      cb();
    }, interval);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    isPolling.value = false;
  };

  /**
   * 摘要告警 id 列表
   * @param alarms 告警列表
   * @returns
   *  - 5 条以下:直接返回 JSON.stringify(idList)
   *  - 5 条以上:返回 JSON.stringify(idList.slice(0, 5))...(共 N 条)
   */
  const summarizeIds = (alarms: ArrayLike<unknown>): string => {
    const list = Array.from(alarms as ArrayLike<unknown>);
    const ids = list.map((a: unknown) =>
      typeof a === 'object' && a !== null && 'id' in a
        ? (a as { id: number | string }).id
        : (a as number | string),
    );
    if (ids.length <= LOG_ID_LIMIT) return JSON.stringify(ids);
    return `${JSON.stringify(ids.slice(0, LOG_ID_LIMIT))}...(共 ${
      ids.length
    } 条)`;
  };

  /**
   * TTS 队列串行切 Toast 回调
   * - 每条 alarm 播完:若下一条是 alarm 则切 Toast
   * - 最后一条 alarm 播完:**不调 clearAlarm**,Toast 关闭由进度条 animationend →
   *   onNotificationDismiss 控制(避免 TTS 早于 popupStayTime 完成时提前销毁 DOM)
   * - 每条 summary 播完:不动 Toast
   */
  const alarmTtsCallbacks: TtsQueueCallbacks = {
    onItemEnd: (item, next) => {
      if (item.type !== 'alarm') return;
      if (next && next.type === 'alarm') {
        notification.showAlarm(next.alert);
      }
      // else: 最后一条 alarm 播完,让进度条自然走完
    },
  };

  /**
   * 计算 top1 + 排序好的告警列表
   * - 保留 sortByPriority 顺序
   */
  const buildOrderedAlarms = (
    alarms: AlarmNotifyItem[],
  ): { ordered: AlarmNotifyItem[]; top1: AlarmNotifyItem | null } => {
    const ordered = sortByPriority(alarms);
    const top1 = pickTopOne(alarms);
    return { ordered, top1 };
  };

  /**
   * 6 个分支统一入口
   * @param filteredAlarms 过滤后的告警/事件列表
   * - popup 开关(Toast)与 sound 开关(TTS)完全独立:
   *   - popupNotificationSwitch === OFF → 只跳过 showAlarm(Toast 卡片相关)
   *   - alarmSoundSwitch / eventSoundSwitch === OFF → useAlarmSound.filterAlerts 内部已读
   *   - 两者互不连坐
   */
  const dispatch = (filteredAlarms: AlarmNotifyItem[]) => {
    if (filteredAlarms.length === 0) {
      return;
    }
    const { ordered, top1 } = buildOrderedAlarms(filteredAlarms);
    const currentAlarm = notification.currentAlarm.value;
    const N = filteredAlarms.length;
    const summaryText = `新增告警 ${N} 条`;
    const popupEnabled = configService.isPopupEnabled();
    const dndActive = isDndActive();
    // Toast 可展示 = popup 开关开 && 非 DND 模式
    const toastEnabled = popupEnabled && !dndActive;
    if (!popupEnabled) {
      console.log(
        `${LOG_TAG} dispatch: popupNotificationSwitch=OFF, Toast 跳过(showAlarm), TTS 仍播放, ids=${summarizeIds(
          filteredAlarms,
        )}`,
      );
    } else if (dndActive) {
      console.log(
        `${LOG_TAG} dispatch: DND 模式, Toast 跳过(showAlarm), ids=${summarizeIds(
          filteredAlarms,
        )}`,
      );
    }

    if (!currentAlarm) {
      // ===== A: Toast 空 =====
      if (N === 1) {
        // A.1
        if (toastEnabled) {
          notification.showAlarm(ordered[0]);
        }
        sound.playAlert(ordered, { callbacks: alarmTtsCallbacks });
        // 无 Toast 时，根据轮询出的告警等级展示图标
        if (!dndActive) {
          notification.setLatestAlarm(filteredAlarms);
        }
        console.log(`${LOG_TAG} step 1: 播放单条告警 ${ordered[0].id}`);
      } else {
        // A.2:首张 Toast + summary + 全部告警 一次性入队串行播
        // playAlertsWithSummary 内部构造 [summary, ...alerts] 再 start,
        // 避免 enqueueSummary + playAlert 两次调用间 start 覆盖问题
        if (toastEnabled) {
          notification.showAlarm(ordered[0]);
        }
        sound.playAlertsWithSummary(ordered, summaryText, {
          callbacks: alarmTtsCallbacks,
        });
        // 无 Toast 时，根据轮询出的告警等级展示图标
        if (!dndActive) {
          notification.setLatestAlarm(filteredAlarms);
        }
        console.log(`${LOG_TAG} step 2: 播放 summary ${summaryText}`);
      }
      return;
    }

    // ===== B: Toast 展示中 =====
    /**
     * 替换判定:新等级 ≥ 当前等级(按 LEVEL_RANK 数值比较)
     * - 告警(2) > 事件(1)
     * - 同类型内:严重 > 重要 > 次要 > 提示
     * - 同级:返回 0(视为"等级相同",不区分时间)
     * - 与顺序无关:取 top1 与 currentAlarm.levelCode 比较
     */
    if (!top1) return; // 防御:实际不可能发生,filteredAlarms 非空
    const shouldReplace = compareLevelOnly(top1, currentAlarm) >= 0;

    if (N === 1) {
      // B.1
      if (shouldReplace) {
        // ≥ 替换:替换 Toast + 替换图标
        if (toastEnabled) {
          notification.showAlarm(ordered[0]);
        }
        sound.stop();
        sound.playAlert(ordered, { callbacks: alarmTtsCallbacks });
        if (!dndActive) {
          notification.setLatestAlarm(filteredAlarms);
        }
        console.log(`${LOG_TAG} step 1: 播放单条告警 ${ordered[0].id}`);
      } else {
        // < 不替换:只播 summary 语音,不弹 Toast,不更新图标
        sound.enqueueSummary('新增告警 1 条', {
          callbacks: alarmTtsCallbacks,
        });
        console.log(`${LOG_TAG} step 2: 播放 summary ${summaryText}`);
      }
      return;
    }

    // B.2
    if (shouldReplace) {
      // ≥ 替换:先停掉旧队列+cancel utterance,再一次性入队 [summary, ...alerts]
      if (toastEnabled) {
        notification.showAlarm(ordered[0]);
      }
      sound.stop();
      sound.playAlertsWithSummary(ordered, summaryText, {
        callbacks: alarmTtsCallbacks,
      });
      if (!dndActive) {
        notification.setLatestAlarm(filteredAlarms);
      }
      console.log(`${LOG_TAG} step 2: 播放 summary ${summaryText}`);
    } else {
      // < 不替换:只播 summary 语音,不弹 Toast,不更新图标
      sound.enqueueSummary(summaryText, { callbacks: alarmTtsCallbacks });
      console.log(`${LOG_TAG} step 2: 播放 summary ${summaryText}`);
    }
  };

  /**
   * 一次轮询告警数据
   * - 5s 一轮:实时告警/事件拉取 + 去重 + 订阅过滤 + Toast/TTS 6 分支编排
   * - 每轮尾部 fetchAlarmEventCount(用 try/finally 保证必跑,即使用户确认了告警 badge 也能减下来)
   * @returns
   */
  const pollOnce = async () => {
    try {
      try {
        // step 0: appScope 校验
        const appScopeSnapshot =
          alarmConfigData.value.applicationScopeList?.filter(
            (i) => i.selected,
          ) ?? [];
        const inScope = isSystemInScope(systemCode);
        console.log(
          `${LOG_TAG} step 0: appScope 校验, systemCode=${systemCode}, appScope=${JSON.stringify(
            appScopeSnapshot.map((i) => i.code),
          )}, isInScope=${inScope}`,
        );
        if (!inScope) {
          console.warn(
            `${LOG_TAG} step 0: 当前 systemCode(${systemCode}) 未在 appScope 中,自动停止轮询`,
          );
          stopPolling();
          return;
        }

        // step 1: 拉取（5s 时间窗 + 当前所选院区）
        const pollWindow = getTimeWindow(ALARM_POLL_INTERVAL);
        const res: any =
          (await TeAlarmAffixApi.queryRealTimeAlarm(axiosInstance, {
            startTime: pollWindow.startTime,
            endTime: pollWindow.endTime,
            spaceCodeList,
          })) ?? [];
        console.log(
          `${LOG_TAG} step 1: 拉取完成, 共 ${
            res?.data?.length
          } 条, data=${JSON.stringify(res?.data ?? [])}`,
          `当前时间=${new Date().toLocaleString()}`,
        );
        if (!res?.data || res?.data?.length === 0) {
          console.log(`${LOG_TAG} return: 拉取为空,无需继续`);
          sound.probeIdle?.();
          return;
        }

        // step 2: 订阅过滤(已取消通知框去重,后端保证 5s 窗口内 id 唯一)
        const subscribedSystemIds = new Set(
          (alarmConfigData.value.subscribeSystemList ?? [])
            .filter((item) => item.selected)
            .map((item) => item.id),
        );
        const subscribedAlarmLevels = new Set<string>(
          (alarmConfigData.value.subscribeAlarmLevelList ?? [])
            .filter((item) => item.selected)
            .map((item) => item.code),
        );
        console.log(
          `${LOG_TAG} step 2: 订阅过滤, 等级=${JSON.stringify(
            subscribedAlarmLevels,
          )}, 模块=${JSON.stringify(subscribedSystemIds)}`,
        );
        const blockedByLevel: number[] = [];
        const blockedByModule: number[] = [];
        const filteredAlarms = res.data.filter((alarm: any) => {
          const levelMatched = subscribedAlarmLevels.has(alarm.levelCode);
          const moduleMatched =
            !alarm.systemId || subscribedSystemIds.has(alarm.systemId);
          if (!levelMatched) {
            blockedByLevel.push(alarm.id as number);
            return false;
          }
          if (!moduleMatched) {
            blockedByModule.push(alarm.id as number);
            return false;
          }
          return true;
        });
        console.log(
          `${LOG_TAG} step 2: 订阅过滤, 输入=${res.data.length}, 通过=${
            filteredAlarms.length
          }, 等级不匹配=${blockedByLevel.length}(${summarizeIds(
            blockedByLevel,
          )}), 模块不匹配=${blockedByModule.length}(${summarizeIds(
            blockedByModule,
          )})`,
        );

        // step 3: 6 分支编排
        if (filteredAlarms.length > 0) {
          console.log(
            `${LOG_TAG} step 3: 进入分发, count=${
              filteredAlarms.length
            }, ids=${summarizeIds(filteredAlarms)}`,
          );
          dispatch(filteredAlarms);
          // listPopup + 非 DND → 触发 onAutoOpenDialog
          const dndActive = isDndActive();
          const listPopupEnabled =
            alarmConfigData.value.listPopupSwitch === SwitchFlag.ON;
          console.log(
            `${LOG_TAG} step 3.y: listPopup 判断, listPopup=${listPopupEnabled}, isDndActive=${dndActive}`,
          );
          if (listPopupEnabled && !dndActive) {
            options?.onAutoOpenDialog?.(filteredAlarms);
            console.log(
              `${LOG_TAG} step 3.y: 触发 onAutoOpenDialog, count=${filteredAlarms.length}`,
            );
          } else {
            console.log(
              `${LOG_TAG} step 3.y: 跳过 onAutoOpenDialog, 原因=${
                !listPopupEnabled ? 'listPopup 未开启' : '处于 DND 时段'
              }`,
            );
          }
        } else {
          console.log(`${LOG_TAG} return: 订阅过滤后为空, 不进入分发`);
        }
      } catch (innerErr) {
        // 内层 step 1~3 异常时,只 warn 一次,继续到 finally 跑 count 同步 badge
        console.warn(
          `${LOG_TAG} 异常: pollOnce step 1~3 失败, err=${
            innerErr instanceof Error ? innerErr.message : innerErr
          }`,
        );
      }
    } finally {
      // step 4: 同步 badge(覆盖模式,直接拉 count 接口拿准确值;失败保留上次值)
      // 用 finally 保证:无论内层 step 1~3 异常 / 提前 return 都会跑,确保告警被确认后 badge 也能减下来
      await fetchAlarmEventCount();
      console.log(
        `${LOG_TAG} step 4: fetchAlarmEventCount 完成, badgeTotal=${stats.totalCount.value}`,
      );
    }
  };

  /**
   * 开始轮询
   */
  const start = () => {
    console.log(
      `${LOG_TAG} start: systemCode=${systemCode}, interval=${ALARM_POLL_INTERVAL}ms`,
    );
    startPolling(pollOnce, ALARM_POLL_INTERVAL);
  };

  /**
   * 停止轮询
   */
  const stop = () => {
    console.log(`${LOG_TAG} stop: systemCode=${systemCode}`);
    stopPolling();
  };

  /**
   * 组件卸载时自动停止轮询
   */
  onUnmounted(() => {
    console.log(`${LOG_TAG} onUnmounted: 自动 stop`);
    stop();
  });

  return {
    start,
    stop,
    isPolling: computed(() => isPolling.value),
  };
};
