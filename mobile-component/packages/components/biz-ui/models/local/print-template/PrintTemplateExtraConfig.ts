export default class PrintTemplateExtraConfig {
  // 列数
  public columns: Nullable<number>;
  // 列距
  public columnGap: Nullable<number>;
  // 水平偏移
  public horizontalOffset: Nullable<number>;
  // 垂直偏移
  public verticalOffset: Nullable<number>;
  // 标签形状
  public labelShape: Nullable<PrintLabelShapeEnum>;
  // 圆角
  public cornerRadius: Nullable<number>;
  // 背景色
  public backgroundColor: Nullable<string>;
  // 背景图片
  public backgroundImage: Nullable<string>;
  // 背景图片文件名
  public backgroundImageFileName: Nullable<string>;
  // 设备像素比
  public dpr: Nullable<string>;
}

// 一物一码-打印标签形状枚举
export enum PrintLabelShapeEnum {
  // 矩形
  RECTANGLE = 'RECTANGLE',
  // 圆角矩形
  ROUNDED_RECTANGLE = 'ROUNDED_RECTANGLE',
  // 圆形
  CIRCLE = 'CIRCLE',
}
