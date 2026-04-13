/**
 * CollapseItem 折叠面板项组件 Props 定义
 * @description 简化版折叠面板项组件
 */
import type { CSSProperties } from 'vue';

export interface CollapseItemProps {
  /** 面板名称 */
  name?: string | number;
  /** 面板标题 */
  title?: string;
  /** 面板内容 */
  content?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  name: '',
  title: '',
  content: '',
  disabled: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
