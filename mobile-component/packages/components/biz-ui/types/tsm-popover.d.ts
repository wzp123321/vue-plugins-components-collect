import { AllowedComponentProps, VNodeProps } from './_common';

declare interface PopoverProps {
  /**
   * 需要显示的提示文字
   * @default ""
   */
  text?: string | number;
  /**
   * 点击复制按钮时，复制的文本，为空则使用text值
   * @default ""
   */
  copyText?: string | number;
  /**
   * 文本大小
   * @default 14
   */
  size?: string | number;
  /**
   * 字体颜色
   * @default "#606266"
   */
  color?: string;
  /**
   * 弹出提示框时，文本的背景色
   * @default "transparent"
   */
  bgColor?: string;
  /**
   * 弹出提示的方向，top-上方，bottom-下方
   * @default "top"
   */
  direction?: 'top' | 'bottom';
  /**
   * 弹出提示的z-index，nvue无效
   * @default 10071
   */
  zIndex?: string | number;
  /**
   * 是否显示复制按钮
   * @default true
   */
  showCopy?: boolean;
  /**
   * 扩展的按钮组
   * @default []
   */
  buttons?: Array<{
    text: string;
    value?: any;
  }>;
  /**
   * 是否显示透明遮罩以防止触摸穿透
   * @default true
   */
  overlay?: boolean;
  /**
   * 是否显示复制成功或者失败的toast
   * @default true
   */
  showToast?: boolean;
}

declare interface PopoverSlots {
  /**
   * 自定义触发内容
   */
  ['default']?: () => any;
}

declare interface _Popover {
  new (): {
    $props: AllowedComponentProps & VNodeProps & PopoverProps;
    $slots: PopoverSlots;
  };
}

export declare const Popover: _Popover;
