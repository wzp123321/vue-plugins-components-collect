/*
 * @Author: wanzp
 * @Date: 2023-04-26 21:15:54
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 对外 utils：兼容 hooks 的简化签名 + re-export 过滤函数
 */
import type { DirectiveBinding } from 'vue';
import type { IDirectiveNumberBindingVO, IDirectiveTextBindingVO } from './directive-filter.api';
import { handleNumberFilter, handleTextFilter } from './directive-filter.filter';

export { handleTextFilter, handleNumberFilter } from './directive-filter.filter';
export { resolveInputTarget, addEventListener, removeEventListener } from './directive-filter.dom';

/**
 * 文本过滤的简化版（供 hooks / composables 直接调用，无需构造 DirectiveBinding）
 * @param value 原始字符串
 * @param options 文本过滤配置
 * @returns 清洗后的字符串
 */
export const filterTextValue = (value: string, options: IDirectiveTextBindingVO = {}): string =>
  handleTextFilter(value, { value: options } as unknown as DirectiveBinding<IDirectiveTextBindingVO>);

/**
 * 数字过滤的简化版（供 hooks / composables 直接调用）
 * @param value 原始字符串
 * @param options 数字过滤配置
 * @returns 清洗后的字符串
 */
export const filterNumberValue = (value: string, options: IDirectiveNumberBindingVO = {}): string =>
  handleNumberFilter(value, { value: options } as unknown as DirectiveBinding<IDirectiveNumberBindingVO>);
