/**
 * Toast 通知状态 hook(闭包 state,无单例)
 *
 * 职责:currentAlarm 展示 + latestAlarm/pulse
 * 编排权(替换/累加/触发)由 useAlarmPolling 负责
 */
import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { AlarmNoticeConfigVO, AlarmNotifyItem } from '../api/index.api';
import { pickTopOne } from '../utils/priority';

export interface UseAlarmNotificationDeps {
  config: Ref<AlarmNoticeConfigVO>;
  isDndActive: (now?: Date) => boolean;
}

export interface UseAlarmNotificationReturn {
  /** 当前展示的告警(用于 Toast 卡片渲染) */
  currentAlarm: ComputedRef<AlarmNotifyItem | null>;
  /** 卡片是否可见(由 currentAlarm 是否非空驱动) */
  visible: ComputedRef<boolean>;
  /** 累计未确认告警数(用于驱动悬浮图标等级) */
  latestAlarm: ComputedRef<AlarmNotifyItem | null>;
  /** 脉冲是否激活(独立于 currentAlarm) */
  pulseActive: ComputedRef<boolean>;

  /**
   * 展示指定告警(立即写入 currentAlarm,组件层 v-if 触发 enter 过渡)
   * - useAlarmPolling 编排时根据 Toast 当前状态 + 优先级判断后调用
   * - 主动替换 Toast 时由 useAlarmPolling 先 sound.stop() 取消旧 TTS
   */
  showAlarm: (alarm: AlarmNotifyItem) => void;
  /**
   * 清空当前 Toast
   * - 用于 useAlarmPolling 串行播报结束时(TTS onItemEnd 触发)
   * - 用于用户主动 × / 进度条结束(由 alarmAffix 监听 dismiss 事件)
   * - 注意：清 Toast 不动 latestAlarm
   */
  clearAlarm: () => void;
  /**
   * 写入"最近一次轮询到的最高等级告警"
   * - 按优先级排序后取 top1
   * - 空数组不动 latestAlarm
   * - 启动脉冲并重置 30s 自动停定时器
   */
  setLatestAlarm: (alarms: AlarmNotifyItem[]) => void;
  /**
   * 清空 latestAlarm + 停脉冲
   */
  clearLatestAlarm: () => void;
  /**
   * 根据等级同步 latestAlarm（不触发脉冲，仅替换图标等级）
   * - 用于 Toast 结束后 / 初始化时根据 maxAlarmLevel 更新悬浮图标
   * - level 为空/无告警时置为 null，图标回退默认灰色
   */
  syncLatestAlarmLevel: (level: string | null | undefined) => void;
}
const PULSE_DURATION_MS = 30000;

export const useAlarmNotification = (): UseAlarmNotificationReturn => {
  //  当前展示的告警
  const currentAlarm = ref<AlarmNotifyItem | null>(null);
  // 累计未确认告警数
  const latestAlarm = ref<AlarmNotifyItem | null>(null);
  // 脉冲是否激活(独立于 currentAlarm)
  const pulseActive = ref(false);

  let pulseTimer: number | null = null;

  const clearPulseTimer = (): void => {
    if (pulseTimer !== null) {
      window.clearTimeout(pulseTimer);
      pulseTimer = null;
    }
  };

  /** 可见性：current 非空时卡片展示 */
  const visible = computed(() => currentAlarm.value !== null);

  /** 写入当前告警(由编排器控制) */
  const showAlarm = (alarm: AlarmNotifyItem): void => {
    currentAlarm.value = alarm;
  };

  /**
   * 清空当前告警 + 联动停脉冲
   * - Toast 卡片消失的同时,pulseActive + 30s 自动停脉冲定时器必须一起清
   * - latestAlarm 保留:让悬浮框图标在 toast 消失后仍展示对应告警等级
   *   (AlarmIconFloat.currentLevel 读 latestAlarm,清了会导致图标回退默认灰色)
   * - clearLatestAlarm() 保持原语义:只清 latestAlarm + pulse,不动 currentAlarm,
   *   用于只需要重置图标但保留 Toast 卡片的场景(目前未使用,保留扩展)
   */
  const clearAlarm = (): void => {
    currentAlarm.value = null;
    pulseActive.value = false;
    clearPulseTimer();
  };

  /**
   * 写入"最近一次轮询到的最高等级告警"。
   * - 按优先级排序后取 top1
   * - 空数组不动 latestAlarm(避免图标闪回默认)
   * - 等级判断由外层 dispatch 控制，此方法无条件写入
   * - 启动脉冲并重置 30s 自动停定时器
   */
  const setLatestAlarm = (alerts: AlarmNotifyItem[]): void => {
    const top = pickTopOne(alerts);
    if (!top) return;
    latestAlarm.value = top;
    pulseActive.value = true;
    clearPulseTimer();
    pulseTimer = window.setTimeout(() => {
      pulseActive.value = false;
      pulseTimer = null;
    }, PULSE_DURATION_MS);
  };

  const clearLatestAlarm = (): void => {
    latestAlarm.value = null;
    pulseActive.value = false;
    clearPulseTimer();
  };

  /**
   * 根据等级同步 latestAlarm（不触发脉冲，仅替换图标等级）
   * - Toast 展示中跳过(由 setLatestAlarm 保持当前 Toast 的图标等级,
   *   避免 fetchAlarmEventCount 的 maxAlarmLevel 把图标刷回更高等级)
   * - 同步等级时关闭脉冲动画（弹框关闭场景下，轮询数量接口覆盖图标后不需要脉冲）
   */
  const syncLatestAlarmLevel = (level: string | null | undefined): void => {
    if (currentAlarm.value) return;
    if (level) {
      latestAlarm.value = { levelCode: level } as AlarmNotifyItem;
    } else {
      latestAlarm.value = null;
    }
    pulseActive.value = false;
    clearPulseTimer();
  };

  return {
    currentAlarm: computed(() => currentAlarm.value),
    visible,
    latestAlarm: computed(() => latestAlarm.value),
    pulseActive: computed(() => pulseActive.value),
    showAlarm,
    clearAlarm,
    setLatestAlarm,
    clearLatestAlarm,
    syncLatestAlarmLevel,
  };
};
