/**
 * TTS 语音播报 hook（闭包 state,无单例）
 *
 * 职责：业务过滤 + 桥接 TTS 队列
 * 暴露：playAlert / playAlertsWithSummary / enqueueSummary  / stop
 */
import { computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import {
  AlarmType,
  type AlarmNoticeConfigVO,
  type AlarmNotifyItem,
} from '../api/index.api';
import {
  createTtsQueue,
  isSpeechSynthesisSupported,
  type TtsQueueCallbacks,
  type TtsQueueInstance,
  type TtsQueueItem,
} from '../utils/tts';

export interface UseAlarmSoundDeps {
  config: Ref<AlarmNoticeConfigVO>;
  isDndActive: (now?: Date) => boolean;
  isSoundEnabledFor: (alertType: AlarmType) => boolean;
}

export interface UseAlarmSoundReturn {
  /** 启动告警 TTS 队列(覆盖式) */
  playAlert: (
    alerts: AlarmNotifyItem[],
    options?: { callbacks?: TtsQueueCallbacks },
  ) => void;
  /**
   * 组合播报:summary(纯语音) + alerts(真实告警) 一次性入队
   * 队首 = summary,队尾 = alerts
   * 用于 useAlarmPolling 的多条新告警分支(A.2 / B.2 ≥ 替换)
   */
  playAlertsWithSummary: (
    alerts: AlarmNotifyItem[],
    summaryText: string,
    options?: { callbacks?: TtsQueueCallbacks },
  ) => void;
  /** 追加纯语音摘要到 TTS 队列尾(无 Toast 卡片关联),不经业务过滤 */
  enqueueSummary: (
    text: string,
    options?: { callbacks?: TtsQueueCallbacks },
  ) => void;
  /** 停止并清空队列 + cancel 当前 utterance,不触发 onItemEnd(Toast 切换由调用方负责) */
  stop: () => void;
  isPlaying: ComputedRef<boolean>;
  /** 当前正在播报的那一条(可能为 null) */
  currentItem: ComputedRef<TtsQueueItem | null>;
  /** 队列空闲时探测 speechSynthesis 引擎是否存活,每轮轮询无告警时自动调用 */
  probeIdle: () => void;
}

export const useAlarmSound = (deps: UseAlarmSoundDeps): UseAlarmSoundReturn => {
  const { config, isDndActive, isSoundEnabledFor } = deps;

  // 队列实例：本 hook 闭包内独立一份,跨容器互不干扰
  const alarmSoundQueue: TtsQueueInstance = createTtsQueue();

  /**
   * 业务过滤三道：DND / sound 开关 / 订阅
   * 保留入参顺序(编排器已按优先级排序)
   */
  const filterAlerts = (
    alerts: AlarmNotifyItem[],
  ): AlarmNotifyItem[] | null => {
    if (!alerts || alerts.length === 0) {
      return null;
    }
    if (isDndActive()) {
      console.log('DND 模式，不播报告警');
      return null;
    }

    const allFromEvent = alerts.every(
      (alarm) => alarm.alarmEventType === AlarmType.EVENT,
    );
    const allFromAlarm = alerts.every(
      (alarm) => alarm.alarmEventType === AlarmType.ALARM,
    );
    if (allFromEvent && !isSoundEnabledFor(AlarmType.EVENT)) {
      return null;
    }
    if (allFromAlarm && !isSoundEnabledFor(AlarmType.ALARM)) {
      return null;
    }

    // 订阅过滤：已订阅专业模块 id 集合
    const subscribedSystemIds = new Set(
      (config.value.subscribeSystemList ?? [])
        .filter((item) => item.selected)
        .map((item) => item.id),
    );
    // 订阅过滤：已订阅告警 / 事件等级
    const subscribedAlarmLevels = new Set<string>(
      (config.value.subscribeAlarmLevelList ?? [])
        .filter((item) => item.selected)
        .map((item) => item.code),
    );

    const filtered = alerts.filter((alarm) => {
      const levelMatched = subscribedAlarmLevels.has(alarm.levelCode);
      const moduleMatched =
        !alarm.systemId || subscribedSystemIds.has(alarm.systemId);
      return levelMatched && moduleMatched;
    });
    if (filtered.length === 0) {
      console.log('订阅过滤后为空，不播报告警', alerts);
      return null;
    }

    return filtered;
  };

  /** 真实告警播报：业务过滤后启动队列 */
  const playAlert = (
    alerts: AlarmNotifyItem[],
    options?: { callbacks?: TtsQueueCallbacks },
  ): void => {
    const passed = filterAlerts(alerts);
    if (!passed) {
      console.log(`step 1: 过滤后告警 ${alerts}`);
      return;
    }
    const items: TtsQueueItem[] = passed.map((alert) => ({
      type: 'alarm',
      alert,
    }));
    alarmSoundQueue.start(items, { callbacks: options?.callbacks });
  };

  /**
   * 组合播报:summary + alerts 一次性入队,避免 start 覆盖问题
   * - 队首放 summary(summary 不走业务过滤,纯语音)
   * - 队尾放按入参顺序的 alerts(走业务过滤)
   * - 业务过滤为空(全被 DND / 订阅 拦掉)则不启动
   */
  const playAlertsWithSummary = (
    alerts: AlarmNotifyItem[],
    summaryText: string,
    options?: { callbacks?: TtsQueueCallbacks },
  ): void => {
    const passed = filterAlerts(alerts);
    if (!passed) {
      return;
    }
    const items: TtsQueueItem[] = [
      { type: 'summary', text: summaryText },
      ...passed.map((alert) => ({ type: 'alarm' as const, alert })),
    ];
    alarmSoundQueue.start(items, { callbacks: options?.callbacks });
  };

  /** 追加纯语音摘要(不经任何业务过滤) */
  const enqueueSummary = (
    text: string,
    options?: { callbacks?: TtsQueueCallbacks },
  ): void => {
    alarmSoundQueue.enqueue(
      { type: 'summary', text },
      { callbacks: options?.callbacks },
    );
  };

  const stop = (): void => alarmSoundQueue.stop();

  /**
   * 队列空闲时静音探测 speechSynthesis 引擎是否存活
   * - 正在播报中跳过
   * - tab 不可见时跳过(探测无效)
   * - 仅发空 utterance,不发出声音
   */
  const probeIdle = (): void => {
    if (alarmSoundQueue.isPlaying.value) {
      return;
    }
    if (!isSpeechSynthesisSupported()) {
      return;
    }
    try {
      const p = new SpeechSynthesisUtterance(' ');
      p.volume = 0;
      const cleanup = () => window.speechSynthesis.cancel();
      p.onend = cleanup;
      p.onerror = cleanup;
      window.speechSynthesis.speak(p);
      console.log('[probeIdle]没有拉取到数据时，静音播放，保持引擎不被挂起！');
    } catch {
      /* noop */
    }
  };

  return {
    playAlert,
    playAlertsWithSummary,
    enqueueSummary,
    stop,
    isPlaying: computed(() => alarmSoundQueue.isPlaying.value),
    currentItem: computed(() => alarmSoundQueue.currentItem.value),
    probeIdle,
  };
};
