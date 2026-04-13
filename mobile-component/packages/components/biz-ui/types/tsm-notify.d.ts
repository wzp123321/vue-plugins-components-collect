import { AllowedComponentProps, VNodeProps } from './_common';

declare interface NotifyProps {
  type?: 'primary' | 'success' | 'warning' | 'error';
  message?: string;
  duration?: number;
  bgColor?: string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _Notify {
  new (): {
    $props: AllowedComponentProps & VNodeProps & NotifyProps;
  };
}

export declare const Notify: _Notify;
