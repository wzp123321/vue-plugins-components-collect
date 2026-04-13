import { AllowedComponentProps, VNodeProps } from './_common';

declare interface ColumnNoticeProps {
  list?: string[];
  speed?: number;
  showIcon?: boolean;
  bgColor?: string;
  color?: string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _ColumnNotice {
  new (): {
    $props: AllowedComponentProps & VNodeProps & ColumnNoticeProps;
  };
}

export declare const ColumnNotice: _ColumnNotice;
