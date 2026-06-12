const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const srcPaletteJson = path.join(rootDir, 'src', 'palette.json')
const srcThemesJson = path.join(rootDir, 'src', 'themes.json')

function cleanDist() {
  if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })
}

function formatGenerated(content) {
  return String(content).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trimEnd() + '\n'
}

function cssVarsBlock(selector, vars) {
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`)
  return `${selector} {\n${lines.join('\n')}\n}\n`
}

function flattenThemeBranch(input, pathStack = []) {
  const result = {}
  Object.entries(input || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value
      return
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`theme branch must contain string leaves only: ${[...pathStack, key].join('.')}`)
    }
    Object.assign(result, flattenThemeBranch(value, [...pathStack, key]))
  })
  return result
}

function hexToRgba(color, opacity) {
  const normalized = String(color).trim().replace('#', '')
  const hex = normalized.length === 3 ? normalized.split('').map(char => char + char).join('') : normalized
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`opacity() only supports hex color values, got: ${color}`)
  }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function resolvePaletteReference(input, palette) {
  return String(input).replace(/var\(([^)]+)\)/g, (_, rawExpression) => {
    const expression = String(rawExpression).trim()
    if (expression.includes(',')) return `var(${rawExpression})`

    const normalized = expression.replace(/^--/, '')
    const candidates = [expression, normalized]
    const matchedKey = candidates.find(key => typeof palette[key] === 'string')
    if (!matchedKey) return `var(${rawExpression})`
    return palette[matchedKey]
  })
}

function resolveOpacitySyntax(input) {
  const opacityMatch = String(input).match(/^(.*)\s+opacity\(([\d.]+)\)$/)
  if (!opacityMatch) return input
  const [, colorValue, opacity] = opacityMatch
  return hexToRgba(colorValue.trim(), opacity.trim())
}

function resolveTokenValue(input, palette) {
  if (typeof input !== 'string') return input
  const paletteResolved = resolvePaletteReference(input, palette)
  return resolveOpacitySyntax(paletteResolved)
}

function resolveTheme(theme, palette, name) {
  const resolved = {}
  Object.entries(theme).forEach(([k, v]) => {
    const next = resolveTokenValue(v, palette, [])
    if (typeof next !== 'string') {
      throw new Error(`themes.${name} value must be string: ${k}`)
    }
    if (String(next).match(/^\{[^}]+\}$/)) {
      throw new Error(`themes.${name} unresolved reference at ${k}: ${next}`)
    }
    resolved[k] = next
  })
  return resolved
}

function readTokenData() {
  if (!fs.existsSync(srcPaletteJson)) throw new Error(`palette.json not found at ${srcPaletteJson}`)
  if (!fs.existsSync(srcThemesJson)) throw new Error(`themes.json not found at ${srcThemesJson}`)
  const palette = JSON.parse(fs.readFileSync(srcPaletteJson, 'utf-8')) || {}
  const themes = JSON.parse(fs.readFileSync(srcThemesJson, 'utf-8')) || {}
  if (!themes.light || !themes.dark) throw new Error('themes.json must contain light and dark')
  const common = flattenThemeBranch(themes.common || {})
  const checkTheme = (theme, name) => {
    const keys = Object.keys(theme || {})
    if (keys.length === 0) throw new Error(`themes.${name} must not be empty`)
    keys.forEach(k => {
      if (!String(k).startsWith('--tsm-')) throw new Error(`themes.${name} key must start with --tsm-: ${k}`)
    })
  }
  const lightInput = { ...common, ...flattenThemeBranch(themes.light) }
  const darkInput = { ...common, ...flattenThemeBranch(themes.dark) }
  checkTheme(common, 'common')
  checkTheme(lightInput, 'light')
  checkTheme(darkInput, 'dark')
  const light = resolveTheme(lightInput, palette, 'light')
  const dark = resolveTheme(darkInput, palette, 'dark')
  return { palette, themes: { light, dark } }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, formatGenerated(content))
}

function buildTokensScss(themes) {
  const lightVars = themes.light
  const darkVars = themes.dark

  const parts = []
  parts.push(cssVarsBlock(`.tsm-theme-light`, lightVars))
  parts.push(cssVarsBlock(`.tsm-theme-dark`, darkVars))
  return parts.join('\n')
}

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(s, d, exclude)
    } else {
      writeFile(d, fs.readFileSync(s, 'utf-8'))
    }
  }
}

function copyThemeProvider() {
  const srcDir = path.join(rootDir, 'src', 'theme-provider')
  const destDir = path.join(distDir, 'theme-provider')
  copyDir(srcDir, destDir)
}

function copyEnvDts() {
  const src = path.join(rootDir, 'src', 'env.d.ts')
  const dest = path.join(distDir, 'env.d.ts')
  if (fs.existsSync(src)) {
    writeFile(dest, fs.readFileSync(src, 'utf-8'))
  }
}

function copyTypes() {
  const src = path.join(rootDir, 'src', 'types', 'index.d.ts')
  const destDir = path.join(distDir, 'types')
  if (fs.existsSync(src)) {
    fs.mkdirSync(destDir, { recursive: true })
    writeFile(path.join(destDir, 'index.d.ts'), fs.readFileSync(src, 'utf-8'))
  }
}

function build() {
  cleanDist()
  const { themes } = readTokenData()
  writeFile(path.join(distDir, 'index.ts'), fs.readFileSync(path.join(rootDir, 'src', 'index.ts'), 'utf-8'))
  writeFile(path.join(distDir, 'index.uts'), fs.readFileSync(path.join(rootDir, 'src', 'index.uts'), 'utf-8'))
  writeFile(path.join(distDir, 'tokens.scss'), buildTokensScss(themes))
  copyThemeProvider()
  copyEnvDts()
  copyTypes()
}

build()
