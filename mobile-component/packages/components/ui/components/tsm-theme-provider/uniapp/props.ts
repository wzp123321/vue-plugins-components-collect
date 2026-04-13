import type { CSSProperties } from 'vue';

export interface ThemeProviderProps {
  mode?: 'light' | 'dark';
  customClass?: string;
  customStyle?: CSSProperties;
}

export const defaultProps = {
  mode: undefined,
  customClass: '',
  customStyle: () => ({}),
} as const;
