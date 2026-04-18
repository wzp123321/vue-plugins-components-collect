/**
 * Badge 徽标组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export enum BadgeNumberType {
  // 超出时展示为${props.max}+
  Overflow = 'overflow',
  // 超出部分省略号，数字长度固定
  Ellipsis = 'ellipsis',
  // 会依据1000作为判断条件，超出1000，显示${value/1000}K，比如2.2k、3.34w，最多保留2位小数
  Limit = 'limit',
}

export interface BadgeProps {
  /** 是否显示圆点 */
  isDot?: boolean;
  /** 显示的内容 */
  value?: number | string;
  /** 是否显示 */
  show?: boolean;
  /** 最大值 */
  max?: number | string;
  /** 主题类型，配合 mode 控制颜色，未指定时走默认危险色样式 */
  theme?: 'primary' | 'success' | 'warning' | 'info';
  /** 当数值为 0 时，是否展示 Badge */
  showZero?: boolean;
  /** 徽标形状, 默认 circle, 可选 ribbon-right: 从右到左, 从左到右, ribbon-round: 圆角, 圆形 bubble: 气泡 */
  shape?: 'circle' | 'ribbon-right' | 'ribbon-round' | 'bubble';
  /** 主题模式, 默认 default，light 模式下使用浅色背景和主题色文字 */
  mode?: 'default' | 'light';
  /** 徽标大小, 默认 medium, 可选 large: 大号 */
  size?: 'medium' | 'large';
  /** 数字显示方式；默认 overflow，可选 ellipsis, limit。
   *  overflow: 超出时展示为 ${props.max}+；
   *  ellipsis: 超出部分省略号，数字长度固定；
   *  limit: 依据 1000 作为判断条件，超出 1000 显示 ${value/1000}K，比如 2.2k、3.34w，最多保留 2 位小数。
   */
  numberType?: 'overflow' | 'ellipsis' | 'limit';
  /** 位置偏移 [x, y]，以右上角为原点，x 向右为正，y 向下为正 */
  offset?: [string | number, string | number];
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps: BadgeProps = {
  isDot: false,
  value: '',
  show: true,
  max: 999,
  showZero: false,
  shape: 'circle',
  mode: 'default',
  size: 'medium',
  numberType: 'overflow',
  offset: [0, 0],
  customClass: '',
};
