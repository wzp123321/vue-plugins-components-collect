import { TextPositionEnum } from './TextPositionEnum';

export default class QrCodeConfig {
  // 二维码码制
  public codeType: Nullable<QrCodeTypeEnum>;
  // 二维码密度
  public density: Nullable<number>;
  // 符号版本
  public symbolVersion: Nullable<string>;
  // 纠错级别
  public errorCorrectionLevel: Nullable<QrCodeErrorCorrectionLevelEnum>;
  // 字符编码
  public charEncoding: Nullable<string>;
  // 文本位置
  public textPosition: Nullable<TextPositionEnum>;
  // 二维码内logo图片url
  public logoUrl: Nullable<string>;
  // 二维码内logo文件名称
  public logoFileName: Nullable<string>;
}

export enum QrCodeErrorCorrectionLevelEnum {
  // L级：可恢复约7%的数据损坏
  L = 'L',
  // M级：可恢复约15%的数据损坏
  M = 'M',
  // Q级：可恢复约25%的数据损坏
  Q = 'Q',
  // H级：可恢复约30%的数据损坏
  H = 'H',
}

// 一物一码-二维码码制枚举
export enum QrCodeTypeEnum {
  // 二维码
  QR_CODE = 'QR_CODE',
}
