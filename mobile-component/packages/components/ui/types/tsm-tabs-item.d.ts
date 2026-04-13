import { AllowedComponentProps, VNodeProps } from './_common';

declare interface TabsItemProps {
  customClass?: string;
  customStyle?: Record<string, any>;
  disabled?: boolean;
  loading?: boolean;
}

declare interface _TabsItem {
  new (): {
    $props: AllowedComponentProps & VNodeProps & TabsItemProps;
  };
}

export declare const TabsItem: _TabsItem;
