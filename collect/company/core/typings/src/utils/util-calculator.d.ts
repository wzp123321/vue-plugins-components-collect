import { ISize } from './utils.api';
/**
 * 标签尺寸计算器
 * @param label 标签文本
 * @param fontSize 文本字号
 * @param lineHeight 文本行高
 * @returns 标签尺寸信息（单位：px） -width：宽 -height：高
 */
export declare function FLabelSizeCalculator(label: string, fontSize?: string, lineHeight?: string): ISize;
