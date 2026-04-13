import { AllowedComponentProps, VNodeProps } from './_common';

declare interface SegmentedProps {
  /**
   * tab的数据
   * @default []
   */
  list?: Array<{
    name: string;
    disabled?: boolean;
  }>;
  /**
   * 当前活动的tab的index
   * @default 0
   */
  current?: string | number;
  /**
   * 激活的颜色
   * @default "#3c9cff"
   */
  activeColor?: string;
  /**
   * 未激活的颜色
   * @default "#303133"
   */
  inactiveColor?: string;
  /**
   * 模式选择，mode=button为按钮形式，mode=segmented时为分段模式
   * @default "button"
   */
  mode?: 'button' | 'segmented';
  /**
   * 字体大小
   * @default 12
   */
  fontSize?: string | number;
  /**
   * 激活tab的字体是否加粗
   * @default true
   */
  bold?: boolean;
  /**
   * mode = button时，组件背景颜色
   * @default "#eeeeef"
   */
  bgColor?: string;
  /**
   * 从list元素对象中读取的键名
   * @default "name"
   */
  keyName?: string;
  /**
   * 切换选项时触发
   * @param index 当前选中项的索引
   */
  onChange?: (index: number) => any;
}

declare interface _Segmented {
  new (): {
    $props: AllowedComponentProps & VNodeProps & SegmentedProps;
  };
}

export declare const Segmented: _Segmented;
