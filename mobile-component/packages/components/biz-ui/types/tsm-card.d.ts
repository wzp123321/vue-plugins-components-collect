import { AllowedComponentProps, VNodeProps } from './_common';

declare interface CardProps {
  title?: string;
  subTitle?: string;
  border?: boolean;
  radius?: number | string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _Card {
  new (): {
    $props: AllowedComponentProps & VNodeProps & CardProps;
  };
}

export declare const Card: _Card;
