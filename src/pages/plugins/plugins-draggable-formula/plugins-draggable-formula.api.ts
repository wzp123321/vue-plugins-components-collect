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
  serialNumber: string;
}
