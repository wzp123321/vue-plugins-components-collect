// api
import { PTB_ITypeSymbolVO } from '../components/pfe-tool-bar/pfe-tool-bar.api';
// 枚举
import { PFE_EFixedType, PFE_ESymbolType } from '../enums';

// 新增、移除需要进行判断相关逻辑的类型
export const PFE_CHECK_TYPES = [PFE_ESymbolType.运算, PFE_ESymbolType.定值];
// 维护数据类名
export const PFE_SERVICE_DATA_CLASS_NAME = 'pfe-service-data-custom';
// 符号列表
export const PFE_TYPE_SYMBOL_LIST: PTB_ITypeSymbolVO[] = [
  {
    type: PFE_ESymbolType.数字,
    typeName: '数字',
    symbolList: [
      {
        id: '1',
        indexName: '',
        indexType: PFE_ESymbolType.数字,
        serialNumber: '%',
        fixed: PFE_EFixedType.内置,
      },
      {
        id: '2',
        indexName: '',
        indexType: PFE_ESymbolType.数字,
        serialNumber: '123',
        fixed: PFE_EFixedType.内置,
      },
    ],
  },
  {
    type: PFE_ESymbolType.运算符,
    typeName: '运算符',
    symbolList: [
      {
        indexName: '+',
        id: '1',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: '+',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '-',
        id: '2',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: '-',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '*',
        id: '3',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: '*',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '/',
        id: '4',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: '/',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '(',
        id: '5',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: '(',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: ')',
        id: '6',
        indexType: PFE_ESymbolType.运算符,
        serialNumber: ')',
        fixed: PFE_EFixedType.内置,
      },
    ],
  },
  {
    type: PFE_ESymbolType.判断符,
    typeName: '判断符',
    symbolList: [
      {
        indexName: '>',
        id: '1',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '>',
        fixed: PFE_EFixedType.内置,
      },
      {
        id: '2',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '≥',
        indexName: '≥',
        fixed: PFE_EFixedType.内置,
      },
      {
        id: '3',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '<',
        indexName: '<',
        fixed: PFE_EFixedType.内置,
      },
      {
        id: '4',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '≤',
        indexName: '≤',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '=',
        id: '5',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '=',
        fixed: PFE_EFixedType.内置,
      },
      {
        indexName: '≠',
        id: '6',
        indexType: PFE_ESymbolType.判断符,
        serialNumber: '≠',
        fixed: PFE_EFixedType.内置,
      },
    ],
  },
];
// 可拖拽的唯一标识
export const PFE_DRAGGABLE_CLASS = 'pfe-draggable';
// 指标类型列表
export const PFE_INDEX_TAB_LIST = [
  {
    label: '基础',
    value: PFE_ESymbolType.基础,
  },
  {
    label: '定值',
    value: PFE_ESymbolType.定值,
  },
  {
    label: '运算',
    value: PFE_ESymbolType.运算,
  },
];
// 符号转指标
export const PFE_INDEX_TYPE_MAP = new Map([
  ['%', PFE_ESymbolType.数字],
  ['123', PFE_ESymbolType.数字],
  ['+', PFE_ESymbolType.运算符],
  ['-', PFE_ESymbolType.运算符],
  ['*', PFE_ESymbolType.运算符],
  ['/', PFE_ESymbolType.运算符],
  ['(', PFE_ESymbolType.运算符],
  [')', PFE_ESymbolType.运算符],
  ['>', PFE_ESymbolType.判断符],
  ['≥', PFE_ESymbolType.判断符],
  ['<', PFE_ESymbolType.判断符],
  ['≤', PFE_ESymbolType.判断符],
  ['=', PFE_ESymbolType.判断符],
  ['≠', PFE_ESymbolType.判断符],
]);
// 维护数据填写不完整高亮背景色
export const PFE_SERVICE_BG_ACTIVE_COLOR = 'var(--te-color-primary-light-9)';
