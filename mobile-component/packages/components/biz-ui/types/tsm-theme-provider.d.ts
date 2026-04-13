import { AllowedComponentProps, VNodeProps } from './_common';

declare interface ThemeProviderProps {
  mode?: 'light' | 'dark';
  customClass?: string;
  customStyle?: Record<string, any>;
}

declare interface _ThemeProvider {
  new (): {
    $props: AllowedComponentProps & VNodeProps & ThemeProviderProps;
  };
}

export declare const ThemeProvider: _ThemeProvider;
