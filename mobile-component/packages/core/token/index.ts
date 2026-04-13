import palette from './src/palette.json'
import themes from './src/themes.json'

export type ThemeMode = keyof typeof themes
export type Tokens = Record<string, string>

export const tokenPalette = palette
export const tokenThemes = themes
