import { EadENodePosition } from '../energy-accounting-deviation.api';

/**
 * 根据字符串计算文本长度
 * @param label
 * @returns
 */
export const mapLabelWidth = (label: string): number => {
  const element = document.createElement('span');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.innerHTML = label;
  document.body.appendChild(element);
  const width = element.clientWidth;

  document.body.removeChild(element);
  return width;
};
/**
 * 根据层级、位置返回内边距
 * @param deep 层级
 * @param position 位置
 * @returns
 */
export const mapPaddingWidth = (deep: number, position?: 'left' | 'right'): number[] => {
  switch (position) {
    case EadENodePosition.左边:
      return [26, deep % 2 ? 45 : 0];
    case EadENodePosition.右边:
      return [deep % 2 ? 45 : 0, 26];
    default:
      return [0, 0];
  }
};
