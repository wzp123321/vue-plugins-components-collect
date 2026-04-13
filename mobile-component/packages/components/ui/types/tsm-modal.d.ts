import { AllowedComponentProps, VNodeProps } from './_common';

declare interface ModalProps {
  show?: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _Modal {
  new (): {
    $props: AllowedComponentProps & VNodeProps & ModalProps;
  };
}

export declare const Modal: _Modal;
