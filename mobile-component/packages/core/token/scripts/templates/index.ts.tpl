import { computed, reactive } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'tsm_theme_mode'

const state = reactive({
  mode: 'light' as ThemeMode,
})
let initialized = false

function ensureThemeMode(): void {
  if (initialized) return
  let saved: any = null
  try {
    saved = uni.getStorageSync(STORAGE_KEY)
  } catch {}
  state.mode = saved === 'dark' ? 'dark' : 'light'
  initialized = true
}

export function getThemeMode(): ThemeMode {
  ensureThemeMode()
  return state.mode
}

export function getThemeClass(): string {
  ensureThemeMode()
  return state.mode === 'dark' ? 'tsm-theme-dark' : 'tsm-theme-light'
}

export function useThemeMode(): any {
  ensureThemeMode()
  return computed(() => state.mode)
}

export function useThemeClass(): any {
  ensureThemeMode()
  return computed(() => getThemeClass())
}

export function setThemeMode(mode: ThemeMode): void {
  ensureThemeMode()
  const nextMode: ThemeMode = mode === 'dark' ? 'dark' : 'light'
  state.mode = nextMode
  try {
    uni.setStorageSync(STORAGE_KEY, nextMode)
  } catch {}
}

export function toggleThemeMode(): void {
  setThemeMode(state.mode === 'dark' ? 'light' : 'dark')
}

export function initThemeMode(): void {
  ensureThemeMode()
}
