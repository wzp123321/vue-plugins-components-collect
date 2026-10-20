import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'node:path'
import { projectRoot } from './utils.js'

/**
 * 递归查找目录
 * @param {string} rootPath - 根路径
 * @param {string} targetName - 目标目录名
 * @param {number} maxDepth - 最大深度
 * @param {number} currentDepth - 当前深度
 * @returns {Array<{path: string, relativePath: string, depth: number}>} 找到的目录列表
 */
function findDirectories(rootPath, targetName, maxDepth = 3, currentDepth = 0) {
  const results = []

  if (currentDepth >= maxDepth) {
    return results
  }

  try {
    if (!existsSync(rootPath)) {
      return results
    }

    const items = readdirSync(rootPath)

    items.forEach((item) => {
      const itemPath = join(rootPath, item)

      try {
        const stat = statSync(itemPath)

        if (stat.isDirectory()) {
          if (item === targetName) {
            // 支持 Windows 和 Unix 路径分隔符
            const normalizedRoot = projectRoot.replace(/\\/g, '/')
            const normalizedPath = itemPath.replace(/\\/g, '/')
            const relativePath = normalizedPath.replace(`${normalizedRoot}/`, '')
            results.push({
              path: itemPath,
              relativePath,
              depth: currentDepth,
            })
          }

          // 跳过 node_modules 等目录
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            const subResults = findDirectories(
              itemPath,
              targetName,
              maxDepth,
              currentDepth + 1,
            )
            results.push(...subResults)
          }
        }
      } catch (err) {
        // 忽略无法访问的目录
        // eslint-disable-next-line no-useless-return
        return
      }
    })
  } catch (err) {
    // 忽略错误
  }

  return results
}

/**
 * 检测项目中的 apis 和 router 目录
 * @returns {{apis: Array, router: Array}} 检测到的目录结构
 */
export function detectProjectStructure() {
  console.log('\n🔍 正在检测项目结构...\n')

  // 查找 apis 目录
  const apisDirs = findDirectories(projectRoot, 'apis')
  // 查找 router 目录
  const routerDirs = findDirectories(projectRoot, 'router')

  // 去重并排序（优先选择 src 下的目录）
  const uniqueApisDirs = Array.from(
    new Map(apisDirs.map((dir) => [dir.path, dir])).values(),
  ).sort((a, b) => {
    // src 下的目录优先（支持 Windows 和 Unix 路径）
    const aInSrc = a.path.includes('/src/') || a.path.includes('\\src\\')
    const bInSrc = b.path.includes('/src/') || b.path.includes('\\src\\')
    if (aInSrc && !bInSrc) return -1
    if (!aInSrc && bInSrc) return 1
    return a.depth - b.depth
  })

  const uniqueRouterDirs = Array.from(
    new Map(routerDirs.map((dir) => [dir.path, dir])).values(),
  ).sort((a, b) => {
    const aInSrc = a.path.includes('/src/') || a.path.includes('\\src\\')
    const bInSrc = b.path.includes('/src/') || b.path.includes('\\src\\')
    if (aInSrc && !bInSrc) return -1
    if (!aInSrc && bInSrc) return 1
    return a.depth - b.depth
  })

  return {
    apis: uniqueApisDirs,
    router: uniqueRouterDirs,
  }
}

/**
 * 显示检测到的目录
 * @param {{apis: Array, router: Array}} structure - 项目结构
 */
export function displayDetectedDirectories(structure) {
  if (structure.apis.length > 0) {
    console.log('📁 检测到 apis 目录:')
    structure.apis.forEach((dir, index) => {
      const marker = index === 0 ? '✅ (推荐)' : '  '
      console.log(`${marker}   ${index + 1}. ${dir.relativePath}`)
    })
    console.log('')
  } else {
    console.log('⚠️  未检测到 apis 目录')
    console.log('')
  }

  if (structure.router.length > 0) {
    console.log('📁 检测到 router 目录:')
    structure.router.forEach((dir, index) => {
      const marker = index === 0 ? '✅ (推荐)' : '  '
      console.log(`${marker}   ${index + 1}. ${dir.relativePath}`)
    })
    console.log('')
  } else {
    console.log('⚠️  未检测到 router 目录')
    console.log('')
  }
}

