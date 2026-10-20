import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { join, resolve } from 'node:path'
import { projectRoot } from './utils.js'

// 模板目录：存储在项目根目录下的 .generate-module-templates
const templatesDir = resolve(projectRoot, '.generate-module-templates')

/**
 * 确保模板目录存在
 */
function ensureTemplatesDir() {
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true })
  }
}

/**
 * 保存配置模板
 * @param {string} templateName - 模板名称
 * @param {Object} config - 配置对象
 * @returns {boolean} 是否保存成功
 */
export function saveTemplate(templateName, config) {
  try {
    ensureTemplatesDir()
    const templatePath = join(templatesDir, `${templateName}.json`)
    const templateData = {
      name: templateName,
      createdAt: new Date().toISOString(),
      config,
    }
    writeFileSync(templatePath, JSON.stringify(templateData, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('保存模板失败:', error)
    return false
  }
}

/**
 * 加载配置模板
 * @param {string} templateName - 模板名称
 * @returns {Object|null} 配置对象或null
 */
export function loadTemplate(templateName) {
  try {
    const templatePath = join(templatesDir, `${templateName}.json`)
    if (!existsSync(templatePath)) {
      return null
    }
    const content = readFileSync(templatePath, 'utf-8')
    const templateData = JSON.parse(content)
    return templateData.config
  } catch (error) {
    console.error('加载模板失败:', error)
    return null
  }
}

/**
 * 列出所有可用的模板
 * @returns {Array<{name: string, createdAt: string}>} 模板列表
 */
export function listTemplates() {
  try {
    ensureTemplatesDir()
    const files = readdirSync(templatesDir)
    const templates = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const templatePath = join(templatesDir, file)
        try {
          const content = readFileSync(templatePath, 'utf-8')
          const templateData = JSON.parse(content)
          return {
            name: templateData.name || file.replace('.json', ''),
            createdAt: templateData.createdAt || '',
            filename: file,
          }
        } catch {
          return {
            name: file.replace('.json', ''),
            createdAt: '',
            filename: file,
          }
        }
      })
    return templates
  } catch (error) {
    console.error('列出模板失败:', error)
    return []
  }
}

/**
 * 删除模板
 * @param {string} templateName - 模板名称
 * @returns {boolean} 是否删除成功
 */
export function deleteTemplate(templateName) {
  try {
    const templatePath = join(templatesDir, `${templateName}.json`)
    if (!existsSync(templatePath)) {
      return false
    }
    unlinkSync(templatePath)
    return true
  } catch (error) {
    console.error('删除模板失败:', error)
    return false
  }
}

