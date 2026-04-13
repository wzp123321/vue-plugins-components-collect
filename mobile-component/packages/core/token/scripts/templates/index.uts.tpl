import { computed, reactive } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'tsm_theme_mode'

const state = reactive({
  mode: 'light',
})
let initialized = false

function ensureThemeMode(): void {
  if (initialized) return
  const saved = uni.getStorageSync(STORAGE_KEY) as string | null
  state.mode = saved == 'dark' ? 'dark' : 'light'
  initialized = true
}

export function getThemeMode(): string {
  ensureThemeMode()
  return state.mode
}

export function getThemeClass(): string {
  ensureThemeMode()
  return state.mode == 'dark' ? 'tsm-theme-dark' : 'tsm-theme-light'
}

export function useThemeMode(): any {
  ensureThemeMode()
  return computed((): string => state.mode)
}

export function useThemeClass(): any {
  ensureThemeMode()
  return computed((): string => getThemeClass())
}

export function setThemeMode(mode: string): void {
  ensureThemeMode()
  const nextMode: ThemeMode = mode == 'dark' ? 'dark' : 'light'
  state.mode = nextMode
  uni.setStorageSync(STORAGE_KEY, nextMode)
}

export function toggleThemeMode(): void {
  setThemeMode(state.mode == 'dark' ? 'light' : 'dark')
}

export function initThemeMode(): void {
  ensureThemeMode()
}
