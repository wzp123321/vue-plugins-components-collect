import { TextPositionEnum } from './TextPositionEnum';

export default class BarCodeConfig {
  // 条码码制
  public codeType: Nullable<BarCodeTypeEnum>;
  // 文本位置
  public textPosition: Nullable<TextPositionEnum>;
  // 条码密度
  public density: Nullable<number>;
  // 文本间隔
  public textGap: Nullable<number>;
  // 条码高度
  public barCodeHeight: Nullable<number>;
}

// 一物一码-条码码制枚举
export enum BarCodeTypeEnum {
  // CODE_128
  CODE128 = 'CODE128',
  // CODE_39
  CODE39 = 'CODE39',
  // EAN_13
  EAN13 = 'EAN13',
}
