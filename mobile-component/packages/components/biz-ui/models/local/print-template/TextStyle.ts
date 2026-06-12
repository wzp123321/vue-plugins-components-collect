export default class TextStyle {
  // 字体
  public fontFamily: Nullable<string>;
  // 字体大小
  public fontSize: Nullable<number>;
  // 字体颜色
  public fontColor: Nullable<string>;
  // 对齐方式
  public textAlign: Nullable<string>;
  // 字间距
  public letterSpacing: Nullable<number>;
  // 行间距（行高）
  public lineHeight: Nullable<number>;
  // 缩放
  public scaleRatio: Nullable<number>;
  // 加粗
  public isBold: Nullable<boolean>;
  // 斜体
  public isItalic: Nullable<boolean>;
  // 下划线
  public isUnderline: Nullable<boolean>;
  // 删除线
  public isStrikeThrough: Nullable<boolean>;
  // 镜像翻转
  public isMirror: Nullable<boolean>;
  // 字体反白
  public isReversed: Nullable<boolean>;
}
