/**
 * TTS(Web Speech API)工具
 *
 * 能力:队列推进 / 串行播报 / 单次播报 / 能力检测
 * 多实例隔离:createTtsQueue() 每次调用产生独立闭包
 * 队列项:alarm 真实告警(可联动 Toast) / summary 纯语音摘要
 */
import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { AlarmNotifyItem } from '../api/index.api';

/** 队内下一条间隔（ms） */
export const TTS_NEXT_INTERVAL_MS = 2000;
/** 兜底单条最长播放时间（ms）：Chrome 偶发 silently drop 时强制推进 */
export const TTS_SILENT_DROP_TIMEOUT_MS = 30000;

/** 测试播报固定文案 */
export const TTS_TEST_CONTENT = '您好,告警语音播报测试正常';

/** 浏览器是否支持 Web Speech API */
export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * 单次播报一段文本
 * - 不进入队列,播一次即结束
 * - 不设 voice / lang(实测设上后 Chrome 在部分机器上会 silently drop)
 * @returns 是否成功启动播报(false:不支持或 speak 抛错)
 */
export const speakText = (text: string): boolean => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[tts] speakText: speechSynthesis 不可用');
    return false;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  try {
    if (typeof window.speechSynthesis.resume === 'function') {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn(
      '[tts] speakText failed:',
      err instanceof Error ? err.message : err,
    );
    return false;
  }
};

/* 队列项 & 回调 */

/** 真实告警/事件播报项 */
export interface TtsAlarmItem {
  type: 'alarm';
  alert: AlarmNotifyItem;
}

/** 纯语音摘要项(无 Toast 卡片关联) */
export interface TtsSummaryItem {
  type: 'summary';
  text: string;
}

export type TtsQueueItem = TtsAlarmItem | TtsSummaryItem;

export interface TtsQueueCallbacks {
  /** 每条开始播放时触发 */
  onItemStart?: (item: TtsQueueItem) => void;
  /**
   * 每条结束时触发(自然结束 / error / silent drop 兜底)
   * next = 队列中的下一条,null = 队列已完
   * stop() 主动 cancel 时不会触发
   */
  onItemEnd?: (item: TtsQueueItem, next: TtsQueueItem | null) => void;
}

export interface TtsQueueStartOptions {
  callbacks?: TtsQueueCallbacks;
}

export interface TtsQueueInstance {
  /** 当前正在播报的那一条 */
  readonly currentItem: Ref<TtsQueueItem | null>;
  /** 是否处于"活跃播报中" */
  readonly isPlaying: ComputedRef<boolean>;
  /**
   * 启动队列(覆盖式,清空旧队列 + cancel 旧 utterance)
   * - items 至少 1 条
   * - 按顺序串行播报,前一条 onend 后 TTS_NEXT_INTERVAL_MS 播下一条
   */
  start: (items: TtsQueueItem[], options?: TtsQueueStartOptions) => void;
  /**
   * 追加一条到队尾
   * - 若当前空闲,立即开始播这条
   * - 若正在播,等当前这条播完自然推进
   */
  enqueue: (item: TtsQueueItem, options?: TtsQueueStartOptions) => void;
  /**
   * 停止并清空队列 + cancel 当前 utterance
   * - 不触发 onItemEnd(由调用方自行处理 Toast 切换)
   */
  stop: () => void;
}

/**
 * 创建 TTS 播报队列实例(每次调用产生独立闭包,跨实例隔离)
 * - 串行播放(无循环),一轮播完即停
 * - 不设 voice / lang(Chrome 在部分机器上会 silently drop)
 * - 30s silent drop 兜底(Chrome 偶发不回调 onend / onerror)
 */
export const createTtsQueue = (): TtsQueueInstance => {
  const queue = ref<TtsQueueItem[]>([]);
  const currentItem = ref<TtsQueueItem | null>(null);
  let callbacks: TtsQueueCallbacks = {};

  let nextTimer: number | null = null;
  let silentDropTimer: number | null = null;
  /** not-allowed 连续失败计数:超过阈值则跳过当前条 */
  let consecutiveNotAllowed = 0;

  const clearTimers = (): void => {
    if (nextTimer !== null) {
      window.clearTimeout(nextTimer);
      nextTimer = null;
    }
    if (silentDropTimer !== null) {
      window.clearTimeout(silentDropTimer);
      silentDropTimer = null;
    }
  };

  const isPlaying = computed(() => currentItem.value !== null);

  const cancelBrowser = (): void => {
    if (!isSpeechSynthesisSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  };

  /** 播报单条 + 播完推进队列 */
  const speakItem = (item: TtsQueueItem): void => {
    if (!isSpeechSynthesisSupported()) return;
    const text =
      item.type === 'alarm'
        ? `${item.alert.objectName ?? ''},${item.alert.content ?? ''}`
        : item.text;
    const utterance = new SpeechSynthesisUtterance(text);
    currentItem.value = item;
    callbacks.onItemStart?.(item);

    let finalized = false;
    const markFinalized = (): void => {
      if (finalized) return;
      finalized = true;
    };
    const advance = (): void => {
      markFinalized();
      const next = queue.value[0] ?? null;
      callbacks.onItemEnd?.(item, next);
      if (next) {
        queue.value = queue.value.slice(1);
        nextTimer = window.setTimeout(() => {
          nextTimer = null;
          speakItem(next);
        }, TTS_NEXT_INTERVAL_MS);
      } else {
        currentItem.value = null;
      }
    };
    utterance.onend = () => {
      consecutiveNotAllowed = 0; // 成功播完,重置连续失败计数
      advance();
    };
    utterance.onerror = (event) => {
      console.warn('[tts] TTS error:', event.error);
      if (event.error === 'not-allowed') {
        consecutiveNotAllowed++;
        if (consecutiveNotAllowed >= 3) {
          // 连续 3 次 not-allowed → 引擎不可恢复, 跳过本条, 推进队列
          // Toast 卡片等 DOM 通知不受影响
          console.warn('[tts] not-allowed 连续 3 次, 跳过本条');
          consecutiveNotAllowed = 0;
          markFinalized();
          advance();
          return;
        }
        // Chrome autoplay policy: tab 闲置后引擎被挂起
        // cancel + resume 尝试恢复, 当前条重新入队重试
        try {
          window.speechSynthesis.cancel();
          if (typeof window.speechSynthesis.resume === 'function') {
            window.speechSynthesis.resume();
          }
        } catch {
          /* noop */
        }
        clearTimers();
        queue.value = [item, ...queue.value];
        setTimeout(() => speakFirstInQueue(), 500);
        return;
      }
      markFinalized();
      advance();
    };
    try {
      // Chrome 兼容: speak 前 cancel 清除可能卡住的旧 utterance
      if (typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }
      if (typeof window.speechSynthesis.resume === 'function') {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn(
        '[tts] speak failed:',
        err instanceof Error ? err.message : err,
      );
      markFinalized();
      advance();
    }
    silentDropTimer = window.setTimeout(() => {
      if (finalized) return;
      console.warn('[tts] TTS silent drop, force next after 30s');
      markFinalized();
      advance();
    }, TTS_SILENT_DROP_TIMEOUT_MS);
  };

  /** 把队列首条取出 + 启动播报 */
  const speakFirstInQueue = (): void => {
    if (queue.value.length === 0) {
      currentItem.value = null;
      return;
    }
    const first = queue.value[0];
    queue.value = queue.value.slice(1);
    speakItem(first);
  };

  const start = (
    items: TtsQueueItem[],
    options: TtsQueueStartOptions = {},
  ): void => {
    if (!isSpeechSynthesisSupported()) {
      console.warn('[tts] start: speechSynthesis 不可用');
      return;
    }
    if (!items || items.length === 0) return;
    consecutiveNotAllowed = 0; // 新一批播报,重置连续失败计数
    callbacks = options.callbacks ?? {};
    clearTimers();
    cancelBrowser();
    queue.value = [...items];
    speakFirstInQueue();
  };

  const enqueue = (
    item: TtsQueueItem,
    options: TtsQueueStartOptions = {},
  ): void => {
    if (!isSpeechSynthesisSupported()) {
      console.warn('[tts] enqueue: speechSynthesis 不可用');
      return;
    }
    if (options.callbacks) callbacks = options.callbacks;
    if (currentItem.value === null) {
      // 空闲,直接播这条
      currentItem.value = item;
      callbacks.onItemStart?.(item);
      queue.value = [item];
      speakFirstInQueue();
    } else {
      // 忙,追加队尾
      queue.value = [...queue.value, item];
    }
  };

  const stop = (): void => {
    clearTimers();
    cancelBrowser();
    currentItem.value = null;
    queue.value = [];
    // 不触发 onItemEnd,Toast 切换由调用方负责
  };

  return { currentItem, isPlaying, start, enqueue, stop };
};
