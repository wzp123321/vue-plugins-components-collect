import { AllowedComponentProps, VNodeProps } from './_common';

declare interface PickerColumnProps {
  values?: any[];
  valueIndex?: number;
  keyName?: string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _PickerColumn {
  new (): {
    $props: AllowedComponentProps & VNodeProps & PickerColumnProps;
  };
}

export declare const PickerColumn: _PickerColumn;
