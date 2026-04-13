import { AllowedComponentProps, VNodeProps } from './_common';

declare interface CircleProgressProps {
  value?: number;
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _CircleProgress {
  new (): {
    $props: AllowedComponentProps & VNodeProps & CircleProgressProps;
  };
}

export declare const CircleProgress: _CircleProgress;
