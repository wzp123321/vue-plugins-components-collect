import { ISize } from './utils.api';

/**
 * 标签尺寸计算器
 * @param label 标签文本
 * @param fontSize 文本字号
 * @param lineHeight 文本行高
 * @returns 标签尺寸信息（单位：px） -width：宽 -height：高
 */
export function FLabelSizeCalculator(label: string, fontSize = '14px', lineHeight = '1'): ISize {
  const element = document.createElement('span');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.whiteSpace = 'pre';
  element.style.lineHeight = lineHeight;
  element.style.fontSize = fontSize;
  element.textContent = label;
  document.body.appendChild(element);
  const width = element.clientWidth;
  const height = element.clientHeight;
  document.body.removeChild(element);
  return { width, height };
}
