/*
 * @Author: wanzp
 * @Date: 2026-06-12 12:00:00
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 过滤纯函数（无 DOM 依赖，可单元测试）
 */
import type { DirectiveBinding } from 'vue';
import {
  type IDirectiveNumberBindingVO,
  type IDirectiveTextBindingVO,
  type IFilterCallbackInfo,
  type TFilterEventType,
} from './directive-filter.api';

/* ============================== 常量 ============================== */

/** clamp 事件（边界收敛）：min / max / maxLength / integral / decimal */
const CLAMP_TYPES: ReadonlySet<TFilterEventType> = new Set<TFilterEventType>([
  'min',
  'max',
  'maxLength',
  'integral',
  'decimal',
]);

/** 文本模式默认 denylist 字符 */
const DEFAULT_TEXT_DENY = String.raw`\`\\;\'\"<>`;

/* ============================== 工具 ============================== */

/** 强类型布尔判定（防止 string "false" 误判） */
const isBoolean = (v: unknown): v is boolean => Object.prototype.toString.call(v) === '[object Boolean]';

/** null / undefined 判定 */
const isNullish = (v: unknown): boolean =>
  v === null || v === undefined || Object.prototype.toString.call(v) === '[object Undefined]';

/**
 * 安全转 number：失败返回 NaN（统一类型，避免返回 string | number 联合反模式）。
 * 业务侧用 Number.isNaN 判定。
 */
const toNumber = (val: string): number => {
  if (val === '' || val === '-' || val === '+' || val === '.') return NaN;
  return Number(val);
};

/** 去除字符串中重复出现的 symbol（用于小数点去重等）
 *
 * 策略：保留首个 symbol，删除后续所有 symbol。
 *
 * 行为：
 *  - 中段重复：'1.2.3' → '1.23'
 *  - 末尾保留：'1.' → '1.'
 *  - 开头保留：'.5' → '.5'
 *  - 单一：无变化
 *  - 末尾多个：'1..' → '1.'
 *  - 开头多个：'..5' → '.5'
 */
const deduplicate = (target: string, symbol: string): string => {
  if (!target.includes(symbol)) return target;
  const firstIdx = target.indexOf(symbol);
  const lastIdx = target.lastIndexOf(symbol);
  if (firstIdx === lastIdx) return target;
  // 保留 firstIdx 位置的 symbol，删除后续所有
  const before = target.substring(0, firstIdx + 1);
  const after = target
    .substring(firstIdx + 1)
    .split(symbol)
    .join('');
  return before + after;
};

/* ============================== 回调分发 ============================== */

export type TFireCallback = (type: TFilterEventType, original: string, cleaned: string, reason: string) => void;

/**
 * 闭包化回调构造器：调用方传入 onClamp / onInvalidate，得到一个 fire(type, ...) 函数。
 * 相比原 fireCallback(... 6 args) 调用点更简洁，且与 binding 解耦。
 */
export const createFire =
  (onClamp?: (info: IFilterCallbackInfo) => void, onInvalidate?: (info: IFilterCallbackInfo) => void): TFireCallback =>
  (type, original, cleaned, reason) => {
    const info: IFilterCallbackInfo = { eventType: type, original, cleaned, reason };
    if (CLAMP_TYPES.has(type)) onClamp?.(info);
    else onInvalidate?.(info);
  };

/* ============================== 文本过滤 ============================== */

/**
 * 文本模式过滤 pipeline：
 *  1. allowPattern    白名单（与 regExp 互斥，同设仅 warn 不抛错）
 *  2. regExp          denylist（默认安全字符）
 *  3. allowSpace      默认 true；false 时移除所有空白
 *  4. allowChinese    默认 true；false 时移除所有非 ASCII
 *  5. maxLength       截断到指定长度
 *  6. transform       'upper' | 'lower' | 自定义函数
 */
export const handleTextFilter = (domValue: string, binding: DirectiveBinding<IDirectiveTextBindingVO>): string => {
  const value0 = binding?.value ?? ({} as IDirectiveTextBindingVO);
  const {
    regExp = null,
    allowSpace = true,
    allowChinese = true,
    allowPattern = null,
    maxLength = null,
    transform = null,
    onClamp,
    onInvalidate,
  } = value0;

  const fire = createFire(onClamp, onInvalidate);

  // 互斥校验：regExp（denylist）与 allowPattern（白名单）语义相反。
  if (regExp instanceof RegExp && allowPattern instanceof RegExp) {
    // eslint-disable-next-line no-console
    console.warn(
      '[v-inputFilter:text] regExp（denylist）与 allowPattern（白名单）互斥，请二选一；当前将按"先 allowPattern 后 regExp"执行，可能产生非预期结果。',
    );
  }

  let value = domValue ?? '';

  // 1. 白名单
  if (allowPattern instanceof RegExp) {
    const matches = value.match(new RegExp(allowPattern, 'g'));
    const next = matches ? matches.join('') : '';
    if (next !== value) {
      fire('allowPattern', value, next, '白名单过滤');
      value = next;
    }
  }

  // 2. denylist
  const denyReg = regExp instanceof RegExp ? regExp : new RegExp(String.raw`[${DEFAULT_TEXT_DENY}]`, 'g');
  {
    const next = value.replace(denyReg, '');
    if (next !== value) {
      fire('denyPattern', value, next, '命中禁用字符');
      value = next;
    }
  }

  // 3. 空格
  if (isBoolean(allowSpace) && !allowSpace) {
    const next = value.replace(/\s+/g, '');
    if (next !== value) {
      fire('denyPattern', value, next, '移除空白字符');
      value = next;
    }
  }

  // 4. 中文
  if (isBoolean(allowChinese) && !allowChinese) {
    const next = value.replace(/[^\x00-\xff]/g, '');
    if (next !== value) {
      fire('denyPattern', value, next, '移除非 ASCII');
      value = next;
    }
  }

  // 5. 最大长度
  if (typeof maxLength === 'number' && maxLength >= 0 && value.length > maxLength) {
    const next = value.substring(0, maxLength);
    fire('maxLength', value, next, `超过 maxLength=${maxLength}`);
    value = next;
  }

  // 6. transform
  if (transform) {
    const next =
      typeof transform === 'function'
        ? transform(value)
        : transform === 'upper'
          ? value.toUpperCase()
          : value.toLowerCase();
    if (next !== value) {
      fire('transform', value, next, `transform=${typeof transform === 'function' ? 'fn' : transform}`);
      value = next;
    }
  }

  return value;
};

/* ============================== 数字过滤 ============================== */

/**
 * 数字模式过滤 pipeline：
 *  1.   一次清理：仅保留数字、小数点、负号、（可选）正号
 *  1.5  清理中间非法 - / +
 *  2.   处理符号（剥前导 - 或 +）
 *  3.   首位是 . → 补 0
 *  4.   头部连续 0 但后跟非 . 时削掉一个
 *  5.   !zeroFlag：禁止"0 开头且无小数点"
 *  6.   去掉前导 0
 *  7.   小数点去重 + 截断小数位
 *  8.   截断整数位
 *  9.   min / max 夹回
 */
export const handleNumberFilter = (domValue: string, binding: DirectiveBinding<IDirectiveNumberBindingVO>): string => {
  const v0 = binding?.value ?? ({} as IDirectiveNumberBindingVO);
  const {
    integral = 10,
    decimal = 4,
    negativeFlag = false,
    zeroFlag = false,
    min = null,
    max = null,
    allowPlus = false,
    onClamp,
    onInvalidate,
  } = v0;

  const fire = createFire(onClamp, onInvalidate);

  const dec = Math.max(0, Math.ceil(decimal ?? 0));
  const int = Math.max(1, Math.ceil(integral ?? 10));

  // 1. 一次清理
  const allowDot = dec > 0;
  const regex = new RegExp(
    String.raw`[^0-9${allowDot ? '\\.' : ''}${negativeFlag ? '\\-' : ''}${allowPlus ? '\\+' : ''}]`,
    'g',
  );
  let value = (domValue ?? '').replace(regex, '');

  // 1.5 清理中间非法 - / +
  if (value.length > 1) {
    const firstCh = value.charAt(0);
    const hasLeadingSymbol = firstCh === '-' || firstCh === '+';
    const symbolOk = (firstCh === '-' && negativeFlag) || (firstCh === '+' && allowPlus);
    const rest = hasLeadingSymbol ? value.substring(1) : value;
    if (hasLeadingSymbol && !symbolOk) {
      // 开头符号不合法 → 剥掉
      fire('denyPattern', value, rest, `前导符号 ${firstCh} 与配置不符，已移除`);
      value = rest;
    } else {
      // 开头符号合法（或无符号）：剥离中间可能混入的 - / +
      const cleaned = value.replace(/[-+]/g, (m, idx) => (idx === 0 ? m : ''));
      if (cleaned !== value) {
        fire('denyPattern', value, cleaned, '已移除中间出现的 - / +');
        value = cleaned;
      }
    }
  }

  // 2. 处理符号
  let symbol = '';
  if (value.startsWith('-') && negativeFlag) {
    symbol = '-';
    value = value.substring(1);
  } else if (value.startsWith('+') && allowPlus) {
    value = value.substring(1);
  }

  // 3. 首位是 . → 补 0
  if (allowDot && value.startsWith('.')) {
    value = `0${value}`;
  }

  // 4. 头部连续 0 但后跟非 . 时削掉一个
  if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    value = value.substring(1);
  }

  // 5. !zeroFlag：禁止"0 开头且无小数点"
  if (!zeroFlag && value.length > 0 && value.startsWith('0') && !value.includes('.')) {
    fire('nonZero', value, '', '不允许 0 开头且无小数点');
    value = '';
  }

  // 6. 去掉前导 0
  if (value.length > 1) {
    const trimmed = value.replace(/^0+(?!\.)/, '');
    if (trimmed !== value) {
      fire('denyPattern', value, trimmed, '移除前导 0');
      value = trimmed;
    }
  }

  // 7. 小数点去重 + 截断小数位
  if (value.includes('.') && allowDot) {
    value = deduplicate(value, '.');
    const hasTrailingDot = value.endsWith('.');
    const [intP, decP = ''] = value.split('.');
    let nextDec = decP;
    if (nextDec.length > dec) {
      fire('decimal', `${intP}.${nextDec}`, `${intP}.${nextDec.substring(0, dec)}`, `超过 decimal=${dec}`);
      nextDec = nextDec.substring(0, dec);
    }
    // 归一：decP 全 0（如 0.0 / 1.00）→ intP；保留末尾 . 供用户继续输入
    if (nextDec.length > 0 && /^0+$/.test(nextDec)) {
      value = intP;
    } else if (nextDec.length > 0) {
      value = `${intP}.${nextDec}`;
    } else if (hasTrailingDot) {
      value = `${intP}.`;
    } else {
      value = intP;
    }
  } else if (value.includes('.')) {
    // decimal=0 但仍有 . 残留
    value = value.replace(/\./g, '');
  }

  // 8. 截断整数位
  const [intP, decP = ''] = value.split('.');
  let nextInt = intP;
  if (nextInt.length > int) {
    fire(
      'integral',
      `${symbol}${nextInt}${decP ? '.' + decP : ''}`,
      `${symbol}${nextInt.substring(0, int)}${decP ? '.' + decP : ''}`,
      `超过 integral=${int}`,
    );
    nextInt = nextInt.substring(0, int);
  }
  // 保留末尾 . 供用户继续输入
  const hasTrailingDot = decP === '' && value.endsWith('.');
  value = decP ? `${symbol}${nextInt}.${decP}` : hasTrailingDot ? `${symbol}${nextInt}.` : `${symbol}${nextInt}`;

  // 归一 +0 → 0（+ 是冗余符号；-0 保留，负零在用户视角有符号意义），
  // 0.0 → 0 已在步骤 7 中处理（decP 全 0 → intP）
  if (value === '+0') value = '0';

  // 9. min / max 夹回
  if (value !== '' && !isNullish(min)) {
    const n = toNumber(value);
    if (!Number.isNaN(n) && n < (min as number)) {
      const next = String(min);
      fire('min', value, next, `低于 min=${min}`);
      value = next;
    }
  }
  if (value !== '' && !isNullish(max)) {
    const n = toNumber(value);
    if (!Number.isNaN(n) && n > (max as number)) {
      const next = String(max);
      fire('max', value, next, `高于 max=${max}`);
      value = next;
    }
  }

  return value;
};
