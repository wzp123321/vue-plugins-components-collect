// 可拖拽的唯一标识
export const PDF_DRAGGABLE_CLASS = 'pdf-draggable';
// 指标类型
export enum PDF_EFieldType {
  基础,
  定值,
  运算,
  时间,
  数字,
  运算符,
  判断符,
}

// 指标
export interface PDF_IFieldVO {
  id: string;
  indexType: PDF_EFieldType;
  name: string;
  // 值
  value: string;
  serialNumber: string;
  // 单位-目前只有%
  unit: string;
  // 是否可配置公式
  configureFormulaFlag: boolean;
  // 是否可配置数据
  configureDataFlag: boolean;
  // 是否可编辑
  editable: boolean;
  // 是否是预制数据
  prefabricateFlag: boolean;
}
