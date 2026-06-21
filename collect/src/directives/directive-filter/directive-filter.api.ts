/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:47:57
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 指令 API & 回调事件类型
 */

/** 指令版本号（业务可读，用于诊断与版本对齐） */
export const VERSION = '2.0.0';

export enum EDirectiveType {
  文本 = 'text',
  数字 = 'number',
}

/**
 * 指令干预事件的类型。
 * - 越界（clamp）: min / max / maxLength / integral / decimal
 * - 清洗（invalidate）: denyPattern / allowPattern / nonZero / transform
 */
export type TFilterEventType =
  | 'min'
  | 'max'
  | 'maxLength'
  | 'integral'
  | 'decimal'
  | 'denyPattern'
  | 'allowPattern'
  | 'nonZero'
  | 'transform';

/** 干预事件信息 */
export interface IFilterCallbackInfo {
  /**
   * 事件类型（即 TFilterEventType）。
   * 命名带 `event` 前缀以与 HTMLInputElement.type 等"输入框类型"区分。
   */
  eventType: TFilterEventType;
  /** 清洗前的原始值 */
  original: string;
  /** 清洗后的值 */
  cleaned: string;
  /** 人类可读的描述，便于业务侧提示 */
  reason: string;
}

/**
 * 文本模式 binding
 *
 * 优先级（自上而下，后置步骤作用于前置结果）：
 *  1. allowPattern    白名单，只保留匹配字符（与 regExp 互斥，二者同设时 allowPattern 先生效）
 *  2. regExp          denylist，命中即删除（可省略，省略时使用默认安全字符规则）
 *  3. allowSpace      默认 true；false 时移除所有空白
 *  4. allowChinese    默认 true；false 时移除所有非 ASCII（基本等价于仅英文数字符号）
 *  5. maxLength       非空时裁剪到指定长度
 *  6. transform       'upper' | 'lower' | 自定义函数
 *
 *  onClamp / onInvalidate 用于业务侧感知过滤行为
 */
export interface IDirectiveTextBindingVO {
  allowChinese?: boolean;
  allowSpace?: boolean;
  regExp?: RegExp | null;
  /** 白名单正则；只保留命中字符 */
  allowPattern?: RegExp | null;
  /** 最大长度 */
  maxLength?: number | null;
  /** 大小写转换或自定义转换函数 */
  transform?: 'upper' | 'lower' | ((value: string) => string) | null;
  /** 越界事件（maxLength） */
  onClamp?: (info: IFilterCallbackInfo) => void;
  /** 清洗事件（denyPattern / allowPattern / transform） */
  onInvalidate?: (info: IFilterCallbackInfo) => void;
  /** 输入框 disabled 时是否跳过过滤，默认 true（disabled 时不动 value） */
  respectDisabled?: boolean;
  /** 过滤异常回调（如 regExp 语法错误） */
  onError?: (err: Error) => void;
}

/**
 * 数字模式 binding
 *
 * 字段全部可选，未传则走默认（integral=10, decimal=4, 不允许负数/0）
 */
export interface IDirectiveNumberBindingVO {
  integral?: number;
  decimal?: number;
  negativeFlag?: boolean;
  zeroFlag?: boolean;
  min?: number | null;
  max?: number | null;
  /** 是否允许 + 前缀，默认 false */
  allowPlus?: boolean;
  /** 越界事件（min / max / integral / decimal） */
  onClamp?: (info: IFilterCallbackInfo) => void;
  /** 清洗事件（denyPattern / nonZero） */
  onInvalidate?: (info: IFilterCallbackInfo) => void;
}
