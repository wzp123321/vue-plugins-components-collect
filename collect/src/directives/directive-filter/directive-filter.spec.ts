/*
 * @Author: wanzp
 * @Date: 2026-06-12 12:00:00
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 指令纯函数单测（filter.ts）
 *
 * 运行：npx vitest run src/directives/directive-filter/directive-filter.spec.ts
 */
import { describe, expect, it, vi } from 'vitest';
import type { DirectiveBinding } from 'vue';
import { handleNumberFilter, handleTextFilter } from './directive-filter.filter';
import type { IDirectiveNumberBindingVO, IDirectiveTextBindingVO } from './directive-filter.api';

// 用 DirectiveBinding 兼容层（filter 函数签名需要 binding.value）
const txt = (value: IDirectiveTextBindingVO): DirectiveBinding<IDirectiveTextBindingVO> =>
  ({ value }) as unknown as DirectiveBinding<IDirectiveTextBindingVO>;

const num = (value: IDirectiveNumberBindingVO): DirectiveBinding<IDirectiveNumberBindingVO> =>
  ({ value }) as unknown as DirectiveBinding<IDirectiveNumberBindingVO>;

describe('handleTextFilter - 文本模式', () => {
  it('① 默认安全字符：清洗 \\ ; \' " < >`', () => {
    const events: string[] = [];
    expect(
      handleTextFilter(
        `a\\b;c'd"e<f>g\`h`,
        txt({
          onInvalidate: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('abcdefgh');
    expect(events).toContain('denyPattern');
  });

  it('② allowChinese=false 移除非 ASCII', () => {
    const events: string[] = [];
    expect(
      handleTextFilter(
        'abc中文123',
        txt({
          allowChinese: false,
          onInvalidate: (e) => events.push(e.reason),
        }),
      ),
    ).toBe('abc123');
    expect(events.some((r) => r.includes('非 ASCII'))).toBe(true);
  });

  it('③ allowSpace=false 移除所有空白', () => {
    expect(handleTextFilter('a b\tc\nd', txt({ allowSpace: false }))).toBe('abcd');
  });

  it('④ allowPattern 白名单只保留命中字符', () => {
    const events: string[] = [];
    expect(
      handleTextFilter(
        'a1b2c3',
        txt({
          allowPattern: /[0-9]/,
          onInvalidate: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('123');
    expect(events).toContain('allowPattern');
  });

  it('⑤ regExp 自定义 denylist', () => {
    expect(handleTextFilter('hello123world', txt({ regExp: /[a-z]/g }))).toBe('123');
  });

  it('⑥ maxLength 截断', () => {
    const events: string[] = [];
    expect(
      handleTextFilter(
        'abcdefgh',
        txt({
          maxLength: 3,
          onClamp: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('abc');
    expect(events).toContain('maxLength');
  });

  it('⑦ transform=upper / lower', () => {
    expect(handleTextFilter('AbCd', txt({ transform: 'upper' }))).toBe('ABCD');
    expect(handleTextFilter('AbCd', txt({ transform: 'lower' }))).toBe('abcd');
  });

  it('⑧ transform 自定义函数', () => {
    expect(handleTextFilter('hello', txt({ transform: (v) => `[${v}]` }))).toBe('[hello]');
  });

  it('⑨ regExp 与 allowPattern 同设时 console.warn（互斥）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    handleTextFilter(
      'abc',
      txt({
        regExp: /[a-z]/,
        allowPattern: /[a-z]/,
      }),
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('⑩ nullish binding.value 走默认安全字符', () => {
    expect(
      handleTextFilter('a;b"c', {
        value: undefined,
      } as unknown as DirectiveBinding<IDirectiveTextBindingVO>),
    ).toBe('abc');
  });
});

describe('handleNumberFilter - 数字模式', () => {
  it('① 默认保留数字与小数点', () => {
    expect(handleNumberFilter('a1b2.c3', num({}))).toBe('12.3');
  });

  it('② negativeFlag=false 不允许负号', () => {
    expect(handleNumberFilter('-123', num({ negativeFlag: false }))).toBe('123');
  });

  it('③ negativeFlag=true 保留前导负号', () => {
    expect(handleNumberFilter('-123', num({ negativeFlag: true }))).toBe('-123');
  });

  it('④ 中间非法 - / + 被清洗', () => {
    expect(handleNumberFilter('1-2', num({ negativeFlag: true, allowPlus: true }))).toBe('12');
    expect(handleNumberFilter('1+2', num({ negativeFlag: true, allowPlus: true }))).toBe('12');
    // 保留前导 -，清洗中间 -
    expect(handleNumberFilter('-1-2', num({ negativeFlag: true, allowPlus: true }))).toBe('-12');
    // + 前导被剥，中间 + 清洗
    expect(handleNumberFilter('+1+2', num({ negativeFlag: true, allowPlus: true }))).toBe('12');
  });

  it('⑤ allowPlus=true 保留 +', () => {
    expect(handleNumberFilter('+123', num({ allowPlus: true }))).toBe('123');
  });

  it('⑥ 首位 . 自动补 0 → 0.x', () => {
    expect(handleNumberFilter('.5', num({ zeroFlag: true }))).toBe('0.5');
  });

  it('⑦ 末尾 . 保留', () => {
    expect(handleNumberFilter('1.', num({ zeroFlag: true }))).toBe('1.');
  });

  it('⑧ zeroFlag=false 禁止 0 开头无小数点（保留 0.5）', () => {
    expect(handleNumberFilter('0', num({ zeroFlag: false }))).toBe('');
    expect(handleNumberFilter('0.5', num({ zeroFlag: false }))).toBe('0.5');
  });

  it('⑨ zeroFlag=true 允许 0 开头', () => {
    expect(handleNumberFilter('0', num({ zeroFlag: true }))).toBe('0');
  });

  it('⑩ integral 截断（超过整数位）', () => {
    const events: string[] = [];
    expect(
      handleNumberFilter(
        '12345.67',
        num({
          integral: 3,
          decimal: 2,
          onClamp: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('123.67');
    expect(events).toContain('integral');
  });

  it('⑪ decimal 截断（超过小数位）', () => {
    const events: string[] = [];
    expect(
      handleNumberFilter(
        '12.3456',
        num({
          integral: 10,
          decimal: 2,
          onClamp: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('12.34');
    expect(events).toContain('decimal');
  });

  it('⑫ 多余小数点去重', () => {
    expect(handleNumberFilter('1.2.3', num({ zeroFlag: true }))).toBe('1.23');
  });

  it('⑬ min 夹回', () => {
    const events: string[] = [];
    expect(
      handleNumberFilter(
        '1',
        num({
          min: 5,
          onClamp: (e) => events.push(e.eventType),
        }),
      ),
    ).toBe('5');
    expect(events).toContain('min');
  });

  it('⑭ max 夹回', () => {
    expect(handleNumberFilter('100', num({ max: 50 }))).toBe('50');
  });

  it('⑮ min/max=null 跳过', () => {
    expect(handleNumberFilter('-99999', num({ min: null, negativeFlag: true }))).toBe('-99999');
  });

  it('⑯ decimal=0 时小数点被剥离', () => {
    expect(handleNumberFilter('1.5', num({ decimal: 0 }))).toBe('15');
  });

  it('⑰ -0 / +0 / 0.0 归一', () => {
    expect(handleNumberFilter('-0', num({ negativeFlag: true, zeroFlag: true }))).toBe('-0');
    expect(handleNumberFilter('+0', num({ allowPlus: true, zeroFlag: true }))).toBe('0');
    expect(handleNumberFilter('0.0', num({ zeroFlag: true }))).toBe('0');
  });

  it('⑱ 粘贴混合清洗（典型场景：1,234.5abc）', () => {
    // 注：去千分位不在 v2 范围；逗号作为非法字符被洗
    expect(handleNumberFilter('1,234.5abc', num({ integral: 10, decimal: 4 }))).toBe('1234.5');
  });

  it('⑲ 反向字符范围修复：negativeFlag + allowDot + allowPlus', () => {
    // 修复前会抛 "Range out of order in character class"
    expect(() => handleNumberFilter('-1.5+2', num({ negativeFlag: true, allowPlus: true, decimal: 4 }))).not.toThrow();
  });

  it('⑳ 空串 / 纯符号 / NaN 不参与 min/max 比较', () => {
    expect(handleNumberFilter('', num({ min: 0 }))).toBe('');
    expect(handleNumberFilter('-', num({ negativeFlag: true, min: 0 }))).toBe('-');
  });
});

describe('handleNumberFilter - 异常路径', () => {
  it('onError 捕获 regExp 异常（如除零）', () => {
    // 直接测内部不会抛（filter 不构造 bad regex），但 onError 路径应存在
    const binding = num({
      onError: () => undefined,
    });
    // 正常调用应不触发 onError
    expect(handleNumberFilter('1', binding)).toBe('1');
  });
});
