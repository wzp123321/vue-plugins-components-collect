import { PDF_EFieldType, PDF_IFieldVO } from '../../plugins-draggable-formula.api';

// 指标样式
export const mapTagStyle = (type: PDF_EFieldType) => {
  let style = {};
  switch (type) {
    case PDF_EFieldType.基础:
      style = {
        color: 'rgb(24, 144, 255)',
        backgroundColor: 'rgb(232, 244, 255)',
        border: '1px solid rgb(209, 233, 255)',
      };
      break;
    case PDF_EFieldType.定值:
      style = {
        color: 'rgb(82, 196, 26)',
        backgroundColor: 'rgb(254, 232, 208)',
        border: '1px solid rgb(220, 243, 209)',
      };
      break;
    case PDF_EFieldType.运算:
      style = {
        color: 'rgb(250, 140, 22)',
        backgroundColor: 'rgb(209, 233, 255)',
        border: '1px solid rgb(254, 232, 208)',
      };
      break;
    case PDF_EFieldType.判断符:
      style = {
        border: '1px solid rgba(139, 199, 255, 1)',
        background: 'rgba(255, 255, 255, 1)',
        color: 'rgba(24, 144, 255, 1)',
      };
      break;
    default:
      style = {
        border: ' 1px solid rgba(200, 201, 204, 1)',
        background: 'rgba(255, 255, 255, 1)',
        color: 'rgba(144, 147, 153, 1)',
      };
      break;
  }

  return style;
};

// 指标列表
export const mockList: PDF_IFieldVO[] = Array.from({ length: 10 }, (item, index) => ({
  indexType: PDF_EFieldType.基础,
  name: `测试-${index}`,
  id: index + '',
  serialNumber: `${index}`,
  unit: '',
  configureDataFlag: false,
  editable: false,
  prefabricateFlag: (Math.random() * 2).toFixed(0) === '1',
  configureFormulaFlag: (Math.random() * 2).toFixed(0) === '1',
  value: '',
}));
