/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:47:57
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-05 20:20:49
 * @Description:
 */
export enum EDirectiveType {
  文本 = 'text',
  数字 = 'number',
}

/**
 * @param allowChinese 是否允许中文
 * @param allowSpace 是否允许空格
 * @param regExp 正则
 */
export interface IDirectiveTextBindingVO {
  allowChinese: boolean;
  allowSpace: boolean;
  regExp: RegExp;
}

/**
 * @param integral 整数位
 * @param decimal 小数位
 * @param negative 是否支持负数
 * @param min 最小
 * @param max 最大
 */
export interface IDirectiveNumberBindingVO {
  integral: number;
  decimal: number;
  negative: boolean;
  min: number | null;
  max: number | null;
}
