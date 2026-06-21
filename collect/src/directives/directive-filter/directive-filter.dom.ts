/*
 * @Author: wanzp
 * @Date: 2026-06-12 12:00:00
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 指令的 DOM 工具（无业务依赖，可脱离 Vue 单独测试）
 */

/**
 * 从指令 el 中找出真正的 input / textarea 节点。
 * - el 本身就是原生 input/textarea → 直接返回
 * - el 是包装组件（el-input / el-textarea / 自定义）→ 查内部 input/textarea
 * - 找不到 → 返回 null（指令静默跳过）
 */
export const resolveInputTarget = (
  el: HTMLElement,
): HTMLInputElement | HTMLTextAreaElement | null => {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el;
  const inner = el.querySelector('input, textarea');
  return inner as HTMLInputElement | HTMLTextAreaElement | null;
};

/**
 * 轻量 addEventListener 包装。
 * 不传 options 时等价于 el.addEventListener(event, handler)；
 * 包装目的是统一 options 类型签名，方便指令层做调用约定。
 */
export const addEventListener = (
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions | boolean,
): void => {
  el.addEventListener(event, handler, options);
};

export const removeEventListener = (
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions | boolean,
): void => {
  el.removeEventListener(event, handler, options);
};
