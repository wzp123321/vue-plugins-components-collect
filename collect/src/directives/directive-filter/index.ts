/*
 * @Author: wanzp
 * @Date: 2026-06-12 12:00:00
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 指令注册（v2 重构版）
 *  - 拆文件：dom 工具 → directive-filter.dom.ts；过滤逻辑 → directive-filter.filter.ts
 *  - isApplying 锁：防止 applyCleanedValue 同步 dispatch 触发 input handler 递归
 *  - respectDisabled：disabled 状态下跳过过滤
 *  - onError：捕获 regExp 语法错等异常
 *  - 4 事件兜底：input / paste / drop / change
 */
import type { App, DirectiveBinding, ObjectDirective } from 'vue';
import { nextTick } from 'vue';
import { EDirectiveType, VERSION } from './directive-filter.api';
import { addEventListener, removeEventListener, resolveInputTarget } from './directive-filter.dom';
import { handleNumberFilter, handleTextFilter } from './directive-filter.filter';

export { VERSION, EDirectiveType } from './directive-filter.api';
export {
  handleTextFilter,
  handleNumberFilter,
  filterTextValue,
  filterNumberValue,
  resolveInputTarget,
} from './directive-filter.utils';

/* ============================== 监听器缓存 ============================== */

/**
 * 按 target 缓存当前挂的监听器集合（input / paste / drop / change）。
 * 每次 binding 更新（beforeUpdate）会先 remove 旧的，再 add 新的，避免重复挂载。
 */
type TInputTarget = HTMLInputElement | HTMLTextAreaElement;
const inputHandlerMap: WeakMap<TInputTarget, EventListener> = new WeakMap();
const pasteHandlerMap: WeakMap<TInputTarget, EventListener> = new WeakMap();
const dropHandlerMap: WeakMap<TInputTarget, EventListener> = new WeakMap();
const changeHandlerMap: WeakMap<TInputTarget, EventListener> = new WeakMap();

/** 防止 applyCleanedValue 同步 dispatch → input handler 递归触发 */
const applyingMap: WeakSet<TInputTarget> = new WeakSet();

/* ============================== 类型嗅探 ============================== */

/** 数字 binding 的特征字段（出现任一则视作数字模式） */
const NUMBER_FIELDS = ['integral', 'decimal', 'negativeFlag', 'zeroFlag', 'min', 'max', 'allowPlus'] as const;

/**
 * 当未指定 arg 时，根据 binding.value 的字段特征嗅探模式。
 * 优先级：
 *  1. 出现任一数字特征字段 → 数字
 *  2. 否则 → 文本（最常用 fallback）
 */
const detectType = (binding: DirectiveBinding<any>): EDirectiveType => {
  const v = binding?.value;
  if (v && typeof v === 'object') {
    for (const k of NUMBER_FIELDS) {
      if (k in v) return EDirectiveType.数字;
    }
  }
  return EDirectiveType.文本;
};

/* ============================== 过滤主流程 ============================== */

const filter = (target: TInputTarget, binding: DirectiveBinding<any>): string => {
  const type: EDirectiveType | string = binding.arg ?? detectType(binding);
  const domValue = target.value;
  try {
    switch (type) {
      case EDirectiveType.文本:
        return handleTextFilter(domValue, binding);
      case EDirectiveType.数字:
        return handleNumberFilter(domValue, binding);
      default:
        return domValue;
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const onError = (binding?.value as any)?.onError;
    if (typeof onError === 'function') onError(e);
    else
      // eslint-disable-next-line no-console
      console.error('[v-inputFilter] 过滤执行异常：', e);
    return domValue;
  }
};

/** 主动把清洗结果写回 + 派发 input 事件，触发 v-model 同步。带 isApplying 锁防递归。 */
const applyCleanedValue = (target: TInputTarget, cleaned: string): void => {
  if (target.value === cleaned) return;
  if (applyingMap.has(target)) return; // 已在写入流程中，跳过防止递归
  applyingMap.add(target);
  try {
    target.value = cleaned;
    // 异步派发，避免与 input handler 同步形成递归（即使 dirty check 兜底也加这道防线）
    queueMicrotask(() => {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    });
  } finally {
    applyingMap.delete(target);
  }
};

/* ============================== 监听器挂载 / 卸载 ============================== */

const attachHandler = (el: HTMLElement, binding: DirectiveBinding<any>): void => {
  const target = resolveInputTarget(el);
  if (!target) return;

  // 移除旧 handler
  const oldInput = inputHandlerMap.get(target);
  if (oldInput) {
    removeEventListener(target, 'input', oldInput);
    inputHandlerMap.delete(target);
  }
  const oldPaste = pasteHandlerMap.get(target);
  if (oldPaste) {
    removeEventListener(target, 'paste', oldPaste);
    pasteHandlerMap.delete(target);
  }
  const oldDrop = dropHandlerMap.get(target);
  if (oldDrop) {
    removeEventListener(target, 'drop', oldDrop);
    dropHandlerMap.delete(target);
  }
  const oldChange = changeHandlerMap.get(target);
  if (oldChange) {
    removeEventListener(target, 'change', oldChange);
    changeHandlerMap.delete(target);
  }

  // 1. input
  const inputHandler: EventListener = (e) => {
    const ev = e as InputEvent;
    if (ev.isComposing) return; // IME 组合中跳过
    if (shouldSkip(target, binding)) return; // disabled 跳过
    const t = e.target as TInputTarget;
    applyCleanedValue(t, filter(t, binding));
  };
  addEventListener(target, 'input', inputHandler);
  inputHandlerMap.set(target, inputHandler);

  // 2. paste 兜底
  const pasteHandler: EventListener = () => {
    if (shouldSkip(target, binding)) return;
    setTimeout(() => {
      const t = resolveInputTarget(el);
      if (t && !shouldSkip(t, binding)) applyCleanedValue(t, filter(t, binding));
    }, 0);
  };
  addEventListener(target, 'paste', pasteHandler);
  pasteHandlerMap.set(target, pasteHandler);

  // 3. drop 兜底
  const dropHandler: EventListener = () => {
    if (shouldSkip(target, binding)) return;
    setTimeout(() => {
      const t = resolveInputTarget(el);
      if (t && !shouldSkip(t, binding)) applyCleanedValue(t, filter(t, binding));
    }, 0);
  };
  addEventListener(target, 'drop', dropHandler);
  dropHandlerMap.set(target, dropHandler);

  // 4. change 兜底（失焦最终态）
  const changeHandler: EventListener = () => {
    if (shouldSkip(target, binding)) return;
    const t = resolveInputTarget(el);
    if (t) applyCleanedValue(t, filter(t, binding));
  };
  addEventListener(target, 'change', changeHandler);
  changeHandlerMap.set(target, changeHandler);
};

const detachHandler = (el: HTMLElement): void => {
  const target = resolveInputTarget(el);
  if (!target) return;
  const oldInput = inputHandlerMap.get(target);
  if (oldInput) {
    removeEventListener(target, 'input', oldInput);
    inputHandlerMap.delete(target);
  }
  const oldPaste = pasteHandlerMap.get(target);
  if (oldPaste) {
    removeEventListener(target, 'paste', oldPaste);
    pasteHandlerMap.delete(target);
  }
  const oldDrop = dropHandlerMap.get(target);
  if (oldDrop) {
    removeEventListener(target, 'drop', oldDrop);
    dropHandlerMap.delete(target);
  }
  const oldChange = changeHandlerMap.get(target);
  if (oldChange) {
    removeEventListener(target, 'change', oldChange);
    changeHandlerMap.delete(target);
  }
};

/** disabled 时跳过过滤（默认行为，可在 binding 中关掉） */
const shouldSkip = (target: TInputTarget, binding: DirectiveBinding<any>): boolean => {
  const respectDisabled = (binding?.value as any)?.respectDisabled;
  if (respectDisabled === false) return false; // 显式关掉兜底
  return target.disabled === true;
};

/* ============================== Vue 指令 ============================== */

const directive: ObjectDirective<HTMLElement, any> = {
  created(el, binding) {
    attachHandler(el, binding);
  },
  mounted(el, binding) {
    const target = resolveInputTarget(el);
    if (target && !shouldSkip(target, binding)) {
      applyCleanedValue(target, filter(target, binding));
    }
    // 包装组件（el-input / el-textarea）下内部 input 渲染滞后，nextTick + RAF 兜底
    void nextTick(() => {
      const t = resolveInputTarget(el);
      if (t && !shouldSkip(t, binding)) applyCleanedValue(t, filter(t, binding));
      requestAnimationFrame(() => {
        const t2 = resolveInputTarget(el);
        if (t2 && !shouldSkip(t2, binding)) applyCleanedValue(t2, filter(t2, binding));
      });
    });
  },
  beforeUpdate(el, binding) {
    attachHandler(el, binding);
  },
  updated(el, binding) {
    const target = resolveInputTarget(el);
    if (target && !shouldSkip(target, binding)) {
      applyCleanedValue(target, filter(target, binding));
    }
    void nextTick(() => {
      const t = resolveInputTarget(el);
      if (t && !shouldSkip(t, binding)) applyCleanedValue(t, filter(t, binding));
    });
  },
  unmounted(el) {
    detachHandler(el);
  },
};

const registerInputFilter = (app: App): void => {
  app.directive('inputFilter', directive);
  // 暴露版本到全局，便于业务诊断
  // eslint-disable-next-line no-console
  console.info(`[v-inputFilter] registered, version=${VERSION}`);
};

export default registerInputFilter;
