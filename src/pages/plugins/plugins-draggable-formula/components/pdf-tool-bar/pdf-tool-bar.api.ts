import { PDF_EFieldType, PDF_IFieldVO } from '../../plugins-draggable-formula.api';

export const timeList: PDF_IFieldVO[] = [
  {
    id: '1',
    name: '截至上月(所在托管期)',
    indexType: PDF_EFieldType.时间,
    serialNumber: '1',
  },
  {
    id: '2',
    name: '累计(所在托管期)',
    indexType: PDF_EFieldType.时间,
    serialNumber: '1',
  },
];

export const numberList: PDF_IFieldVO[] = [
  {
    id: '1',
    name: '%',
    indexType: PDF_EFieldType.数字,
    serialNumber: '1',
  },
  {
    id: '2',
    name: '123',
    indexType: PDF_EFieldType.数字,
    serialNumber: '2',
  },
];

export const operatorList: PDF_IFieldVO[] = [
  {
    name: '+',
    id: '1',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '1',
  },
  {
    name: '-',
    id: '2',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '2',
  },
  {
    name: 'x',
    id: '3',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '3',
  },
  {
    name: '/',
    id: '4',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '4',
  },
  {
    name: '=',
    id: '5',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '5',
  },
  {
    name: '(',
    id: '6',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '6',
  },
  {
    name: ')',
    id: '7',
    indexType: PDF_EFieldType.运算符,
    serialNumber: '7',
  },
];

export const deciderList: PDF_IFieldVO[] = [
  {
    name: '>',
    id: '1',
    indexType: PDF_EFieldType.判断符,
    serialNumber: '1',
  },
  {
    id: '2',
    indexType: PDF_EFieldType.判断符,
    serialNumber: '2',
    name: '≥',
  },
  {
    id: '3',
    indexType: PDF_EFieldType.判断符,
    serialNumber: '3',
    name: '<',
  },
  {
    id: '4',
    indexType: PDF_EFieldType.判断符,
    serialNumber: '4',
    name: '≤',
  },
  {
    name: '=',
    id: '5',
    indexType: PDF_EFieldType.判断符,
    serialNumber: '5',
  },
];
