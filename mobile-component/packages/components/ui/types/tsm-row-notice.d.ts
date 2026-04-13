import { AllowedComponentProps, VNodeProps } from './_common';

declare interface RowNoticeProps {
  text?: string;
  speed?: number;
  showIcon?: boolean;
  bgColor?: string;
  color?: string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _RowNotice {
  new (): {
    $props: AllowedComponentProps & VNodeProps & RowNoticeProps;
  };
}

export declare const RowNotice: _RowNotice;
