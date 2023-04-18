/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:47:57
 * @LastEditors: wanzp
 * @LastEditTime: 2023-04-18 22:20:18
 * @Description:
 */
export enum EDirectiveType {
  文本 = 'text',
  数字 = 'number',
}

export interface IDirectiveTextBindingVO {
  allowChinese: boolean;
  allowSpace: boolean;
  regExp: RegExp;
}

export interface IDirectiveNumberBindingVO {
  integral: number;
  decimal: number;
  negative: boolean;
  min: number | null;
  max: number | null;
}
