/*
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-02-02 17:16:11
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-21 16:50:05
 * @FilePath: \ts-web-package\packages\components\lib\te-date-switch\src\type.ts
 * @Description: 日期切换组件类型定义
 */
export enum DateTypeEnum {
  YEAR = "year",
  MONOTH = "month",
  DATE = "date",
}

// 计算方式，可加1或减1
export enum AddendTypeEnum {
  PLUS_ONE = 1,
  MINUS_ONE = -1,
}

export type DateType = `${DateTypeEnum}`;

export type AddendType = AddendTypeEnum.PLUS_ONE | AddendTypeEnum.MINUS_ONE;

export interface DateSwitchProps {
  modelValue?: string;
  type: DateType;
  format: string;
  valueFormat?: string;
  forwardLimit?: boolean;
  handleForward?: (date: string) => void;
  handleBackward?: (date: string) => void;
  handleDateChange?: (date: string) => void;
}

// 事件类型
export enum ActionTypeEnum {
  FORWARD = "forward",
  BACKWARD = "backward",
  DATE_CHANGE = "dateChange",
}

const UPDAET_MODEL_VALUE = "update:modelValue";

export const MethodTypeEnum = {
  [ActionTypeEnum.FORWARD]: "handleForward",
  [ActionTypeEnum.BACKWARD]: "handleBackward",
  [ActionTypeEnum.DATE_CHANGE]: "handleDateChange",
};

export const dateSwitchEmits = {
  forward: (date: string) => date,
  backward: (date: string) => date,
  dateChange: (date: string) => date,
  [UPDAET_MODEL_VALUE]: (date: string) => date,
};

export type DateSwitchEmits = typeof dateSwitchEmits;
