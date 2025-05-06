import { PGS_ESymbolType, GPS_IIndexVO } from '../../plugins-draggable-formula.api';

// 指标样式
export const mapTagStyle = (type: PGS_ESymbolType) => {
  let style = {};
  switch (type) {
    case PGS_ESymbolType.基础:
      style = {
        color: 'rgb(24, 144, 255)',
        backgroundColor: 'rgb(232, 244, 255)',
        border: '1px solid rgb(209, 233, 255)',
      };
      break;
    case PGS_ESymbolType.定值:
      style = {
        color: 'rgb(82, 196, 26)',
        backgroundColor: 'rgb(254, 232, 208)',
        border: '1px solid rgb(220, 243, 209)',
      };
      break;
    case PGS_ESymbolType.运算:
      style = {
        color: 'rgb(250, 140, 22)',
        backgroundColor: 'rgb(209, 233, 255)',
        border: '1px solid rgb(254, 232, 208)',
      };
      break;
    case PGS_ESymbolType.判断符:
      style = {
        border: '1px solid rgba(139, 199, 255, 1)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(24, 144, 255, 1)',
      };
      break;
    default:
      style = {
        border: '1px solid rgba(200, 201, 204, 1)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgb(144, 147, 153)',
      };
      break;
  }

  return style;
};

// 指标列表
export const mockList: GPS_IIndexVO[] = Array.from({ length: 10 }, (_item, index) => ({
  indexType: PGS_ESymbolType.基础,
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

// 指标类型列表
export const indexTypeList = [
  {
    label: '基础',
    value: PGS_ESymbolType.基础,
  },
  {
    label: '定值',
    value: PGS_ESymbolType.定值,
  },
  {
    label: '运算',
    value: PGS_ESymbolType.运算,
  },
];
