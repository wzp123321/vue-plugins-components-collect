/**
 * Message 消息提示组件 Props 定义
 * @description 简化版顶部消息提示组件，自动收起
 */
export interface MessageProps {
  /** 是否显示 */
  visible?: boolean;
  /** 到顶部的距离 */
  top?: number | string;
  /** 主题类型 */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** 展示的文字内容 */
  message?: string;
  /** 展示时长，为0时不消失，单位ms */
  duration?: number;
  /** 右侧操作区域：link 按钮 / close 按钮 / none 不展示 */
  rightAction?: 'link' | 'close' | 'none';
}

export const defaultProps = {
  visible: false,
  top: 0,
  type: 'info',
  message: '',
  duration: 3000,
  rightAction: 'close',
} as const;
