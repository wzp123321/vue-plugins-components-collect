/**
 * Switch 开关组件 Props 定义
 * @description 简化版开关组件
 */
import type { CSSProperties } from 'vue';

export enum SwitchSize {
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
}

// 开关节点内边距
export const SWITCH_PADDING = 4;
// 大尺寸宽度
export const SWITCH_LARGE_WIDTH = 56;
// 默认尺寸宽度
export const SWITCH_MEDIUM_WIDTH = 48;
// 小尺寸宽度
export const SWITCH_SMALL_WIDTH = 40;
// 大尺寸高度
export const SWITCH_LARGE_HEIGHT = 32;
// 默认尺寸高度
export const SWITCH_MEDIUM_HEIGHT = 28;
// 小尺寸高度
export const SWITCH_SMALL_HEIGHT = 24;
// 大尺寸开关节点宽度
export const SWITCH_LARGE_NODE_WIDTH = 24;
// 默认尺寸开关节点宽度
export const SWITCH_MEDIUM_NODE_WIDTH = 20;
// 小尺寸开关节点宽度
export const SWITCH_SMALL_NODE_WIDTH = 16;
// 大尺寸文字大小
export const SWITCH_LARGE_TEXT_SIZE = 16;
// 默认尺寸文字大小
export const SWITCH_MEDIUM_TEXT_SIZE = 14;
// 小尺寸文字大小
export const SWITCH_SMALL_TEXT_SIZE = 12;

/**
 * 根据开关尺寸获取开关宽度和高度
 * @param size 开关尺寸
 * @returns 开关宽度和高度
 */
export const getSwitchSize = (size: SwitchSize) => {
  switch (size) {
    case SwitchSize.LARGE:
      return {
        width: SWITCH_LARGE_WIDTH,
        height: SWITCH_LARGE_HEIGHT,
      };
    case SwitchSize.MEDIUM:
      return {
        width: SWITCH_MEDIUM_WIDTH,
        height: SWITCH_MEDIUM_HEIGHT,
      };
    case SwitchSize.SMALL:
      return {
        width: SWITCH_SMALL_WIDTH,
        height: SWITCH_SMALL_HEIGHT,
      };
    default:
      return {
        width: SWITCH_MEDIUM_WIDTH,
        height: SWITCH_MEDIUM_HEIGHT,
      };
  }
};

/**
 * 根据开关尺寸获取开关节点宽度
 * @param size 开关尺寸
 * @returns 开关节点宽度
 */
export const getNodeWidthBySize = (size: SwitchSize) => {
  switch (size) {
    case SwitchSize.LARGE:
      return SWITCH_LARGE_NODE_WIDTH;
    case SwitchSize.MEDIUM:
      return SWITCH_MEDIUM_NODE_WIDTH;
    case SwitchSize.SMALL:
      return SWITCH_SMALL_NODE_WIDTH;
    default:
      return SWITCH_MEDIUM_NODE_WIDTH;
  }
};

export interface SwitchProps {
  /** 是否选中 */
  checked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选中时的值 */
  activeValue?: boolean | string | number;
  /** 未选中时的值 */
  inactiveValue?: boolean | string | number;
  /** 选中时的颜色 */
  activeColor?: string;
  /** 未选中时的颜色 */
  inactiveColor?: string;
  /** 是否显示文字 */
  inactiveText?: boolean;
  /** 开关尺寸: large | medium | small */
  size?: SwitchSize;
  /** 选中时的文字 */
  checkedText?: string;
  /** 未选中时的文字 */
  unCheckedText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  checked: false,
  disabled: false,
  activeValue: true,
  inactiveValue: false,
  activeColor: 'var(--tsm-color-primary)',
  inactiveColor: 'var(--tsm-color-bg-secondary)',
  inactiveText: false,
  checkedText: '开',
  unCheckedText: '关',
  size: SwitchSize.MEDIUM,
  customClass: '',
  customStyle: () => ({}),
} as const;
