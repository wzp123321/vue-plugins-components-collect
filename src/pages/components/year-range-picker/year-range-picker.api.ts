export const DEFAULT_WIDTH = 540;

export enum YRP_EPosition {
  左 = 'left',
  右 = 'right',
}

/**
 * @param value 值
 * @param isToday 是否是今天
 * @param isStart 开始年
 * @param isEnd 结束年
 * @param isInRange 再选中范围内
 * @param isDisabled 是否禁用
 * @param isOutOfView 非当前可视范围内（灰色）
 */
export interface YRP_IYearVO {
  value: number;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isOutOfView: boolean;
}
