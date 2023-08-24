import { PDF_EFieldType, PDF_IFieldVO } from '../../plugins-draggable-formula.api';

// 指标样式
export const PIL_EFieldStyle = {
  [PDF_EFieldType.基础]: {
    color: 'rgb(24, 144, 255)',
    backgroundColor: 'rgb(232, 244, 255)',
    border: '1px solid rgb(209, 233, 255)',
  },
  [PDF_EFieldType.定值]: {
    color: 'rgb(82, 196, 26)',
    backgroundColor: 'rgb(254, 232, 208)',
    border: '1px solid rgb(220, 243, 209)',
  },
  [PDF_EFieldType.运算]: {
    color: 'rgb(250, 140, 22)',
    backgroundColor: 'rgb(209, 233, 255)',
    border: '1px solid rgb(254, 232, 208)',
  },
};

// 指标列表
export const mockList: PDF_IFieldVO[] = Array.from({ length: 10 }, (item, index) => ({
  indexType: PDF_EFieldType.基础,
  name: `测试-${index}`,
  id: index + '',
  serialNumber: `${index}`,
}));
