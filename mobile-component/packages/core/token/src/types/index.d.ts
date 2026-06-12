declare module '@tiansu/ts-mobile-token' {
  export type ThemeMode = 'light' | 'dark'

  export function getThemeMode(): ThemeMode
  export function getThemeClass(): string
  export function useThemeMode(): any
  export function useThemeClass(): any
  export function setThemeMode(mode: ThemeMode): void
  export function toggleThemeMode(): void
  export function initThemeMode(): void

  export const TsmThemeProvider: typeof import('../theme-provider/uniapp/tsm-theme-provider.vue')['default']
}

export {};
