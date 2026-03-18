import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'node:path'
import { getProjectRoot } from '../shared.js'

// 使用 shared.js 的 getProjectRoot 函数，自动检测项目根目录
export const projectRoot = getProjectRoot()

/**
 * 获取相对路径（支持 Windows 和 Unix 路径）
 * @param {string} filePath - 完整文件路径
 * @returns {string} 相对于项目根目录的路径
 */
export function getRelativePath(filePath) {
  // 统一转换为 Unix 风格的路径分隔符进行比较
  const normalizedRoot = projectRoot.replace(/\\/g, '/')
  const normalizedPath = filePath.replace(/\\/g, '/')
  return normalizedPath.replace(`${normalizedRoot}/`, '')
}

/**
 * 验证并标准化为驼峰命名（首字母小写）
 * @param {string} str - 输入字符串
 * @returns {string} 标准化后的驼峰命名
 */
export function normalizeToCamel(str) {
  if (!str || typeof str !== 'string') return ''
  // 移除所有非字母数字字符，然后转换为驼峰
  let result = str.replace(/[^a-zA-Z0-9]/g, '')
  // 确保首字母小写
  if (result.length > 0) {
    result = result.charAt(0).toLowerCase() + result.slice(1)
  }
  return result
}

/**
 * 将驼峰命名转换为帕斯卡命名（首字母大写）
 * @param {string} str - 驼峰命名字符串
 * @returns {string} 帕斯卡命名字符串
 */
export function camelToPascal(str) {
  if (!str || str.length === 0) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 验证模块名称（只接受驼峰命名）
 * @param {string} name - 模块名称
 * @returns {{valid: boolean, message?: string}} 验证结果
 */
export function validateModuleName(name) {
  const trimmed = name.trim()

  // 1. 检查是否为空
  if (!trimmed) {
    return { valid: false, message: '❌ 模块名称不能为空' }
  }

  // 2. 检查是否包含空格
  if (/\s/.test(trimmed)) {
    return { valid: false, message: '❌ 模块名称不能包含空格' }
  }

  // 3. 检查是否只包含字母和数字（驼峰命名）
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed)) {
    return {
      valid: false,
      message:
        '❌ 模块名称必须使用驼峰命名（只能包含字母和数字，且必须以字母开头）\n   示例: userManage, phoneBox, goodsList',
    }
  }

  // 4. 检查首字母是否小写（驼峰命名要求首字母小写）
  if (/^[A-Z]/.test(trimmed)) {
    return {
      valid: false,
      message:
        '❌ 模块名称首字母必须小写（驼峰命名）\n   示例: userManage（正确）而不是 UserManage（错误）',
    }
  }

  // 5. 检查长度（建议2-50个字符）
  if (trimmed.length < 2) {
    return {
      valid: false,
      message: '❌ 模块名称至少需要2个字符',
    }
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      message: '❌ 模块名称不能超过50个字符',
    }
  }

  // 6. 检查是否是保留字
  const reservedWords = [
    'api',
    'apis',
    'views',
    'components',
    'utils',
    'store',
    'router',
    'assets',
    'styles',
    'types',
    'hooks',
    'constants',
    'config',
    'index',
    'main',
    'app',
  ]
  const lowerName = trimmed.toLowerCase()
  if (reservedWords.includes(lowerName)) {
    return {
      valid: false,
      message: `❌ "${trimmed}" 是保留字，不能用作模块名称`,
    }
  }

  return { valid: true }
}

/**
 * 显示名称确认
 * @param {string} inputName - 输入的名称
 * @param {string} normalizedName - 标准化后的名称
 */
export function showNameConfirmation(inputName, normalizedName) {
  console.log('\n📝 模块名称确认:')
  console.log(`   输入名称: ${inputName}`)
  console.log(`   标准化后: ${normalizedName}`)
  if (inputName !== normalizedName) {
    console.log(`   ⚠️  注意: 名称已自动标准化为驼峰命名格式`)
  }
}

/**
 * 创建文件（如果不存在）
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 * @param {string} description - 文件描述
 * @returns {boolean} 是否创建成功
 */
export function createFileIfNotExists(filePath, content, description) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content, 'utf-8')
    const relativePath = getRelativePath(filePath)
    console.log(`✅ 创建${description}: ${relativePath}`)
    return true
  }
  const relativePath = getRelativePath(filePath)
  console.log(`⚠️  ${description}已存在: ${relativePath}`)
  return false
}

