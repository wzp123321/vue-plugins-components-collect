import {
  existsSync,
  rmSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'fs'
import { resolve, join, extname } from 'node:path'
import {
  projectRoot,
  normalizeToCamel,
  camelToPascal,
  validateModuleName,
  getRelativePath,
} from './utils.js'
import {
  createQuestionInterface,
  askQuestion,
  askYesNo,
} from './interactive.js'

const srcPath = resolve(projectRoot, 'src')

/**
 * 递归获取目录下所有指定扩展名的文件
 * @param {string} dir - 目录路径
 * @param {string[]} extensions - 文件扩展名数组，如 ['.vue', '.ts', '.js']
 * @param {string[]} files - 结果数组
 */
function getAllFiles(dir, extensions, files = []) {
  if (!existsSync(dir)) {
    return files
  }

  const items = readdirSync(dir)
  items.forEach((item) => {
    const fullPath = join(dir, item)
    try {
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        // 跳过 node_modules 等目录
        if (!item.startsWith('.') && item !== 'node_modules') {
          getAllFiles(fullPath, extensions, files)
        }
      } else if (stat.isFile()) {
        const ext = extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // 忽略无法访问的文件
    }
  })
  return files
}

/**
 * 从文件中移除模块相关的 import 语句
 * @param {string} filePath - 文件路径
 * @param {string} moduleName - 模块名称
 * @returns {boolean} 是否修改了文件
 */
function removeImportsFromFile(filePath, moduleName) {
  if (!existsSync(filePath)) {
    return false
  }

  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false

    // 匹配各种可能的 import 格式：
    // import ... from '@/apis/{moduleName}'
    // import ... from '@/apis/{moduleName}/index'
    // import ... from '@/apis/{moduleName}/index.api'
    // import ... from '@/apis/{moduleName}/index.mock'
    // import ... from '@/views/{moduleName}'
    // import ... from '@/views/{moduleName}/modules/...'
    // import ... from './{moduleName}'
    // import type ... from ...

    const importPatterns = [
      // 匹配 @/apis/{moduleName} 相关的 import（包括完整路径和子路径）
      new RegExp(
        `import\\s+(?:type\\s+)?[^'"]*\\s+from\\s+['"]@/apis/${moduleName}(?:/index)?(?:\\.api|\\.mock)?['"];?\\s*\\n`,
        'g',
      ),
      // 匹配 @/views/{moduleName} 相关的 import
      new RegExp(
        `import\\s+(?:type\\s+)?[^'"]*\\s+from\\s+['"]@/views/${moduleName}(?:/.*)?['"];?\\s*\\n`,
        'g',
      ),
      // 匹配相对路径导入（如 ./modules/{moduleName} 或 ../{moduleName}）
      new RegExp(
        `import\\s+(?:type\\s+)?[^'"]*\\s+from\\s+['"](?:\\.\\.?/)+.*${moduleName}[^'"]*['"];?\\s*\\n`,
        'g',
      ),
    ]

    importPatterns.forEach((pattern) => {
      const beforeLength = content.length
      content = content.replace(pattern, '')
      if (content.length !== beforeLength) {
        modified = true
      }
    })

    // 清理多余的空行（连续三个或更多换行替换为两个换行）
    if (modified) {
      content = content.replace(/\n{3,}/g, '\n\n')
      writeFileSync(filePath, content, 'utf-8')
      const relativePath = getRelativePath(filePath)
      console.log(`   ✅ 已清理 import: ${relativePath}`)
      return true
    }

    return false
  } catch (error) {
    // 忽略无法读取的文件
    return false
  }
}

/**
 * 扫描并清理所有文件中的模块相关 import
 * @param {string} moduleName - 模块名称
 * @returns {number} 清理的文件数量
 */
function removeImportsFromAllFiles(moduleName) {
  console.log(`\n🔍 扫描并清理所有文件中的 import 语句...`)

  const extensions = ['.vue', '.ts', '.js', '.tsx', '.jsx']
  const allFiles = getAllFiles(srcPath, extensions)

  let cleanedCount = 0
  allFiles.forEach((filePath) => {
    // 跳过要删除的模块本身
    if (
      filePath.includes(`/views/${moduleName}/`) ||
      filePath.includes(`/apis/${moduleName}/`) ||
      filePath.includes(`/router/modules/${moduleName}.ts`)
    ) {
      return
    }

    if (removeImportsFromFile(filePath, moduleName)) {
      cleanedCount++
    }
  })

  if (cleanedCount > 0) {
    console.log(`✅ 已从 ${cleanedCount} 个文件中清理了相关 import 语句`)
  } else {
    console.log(`⚠️  未找到需要清理的 import 语句`)
  }

  return cleanedCount
}

/**
 * 从 routes.ts 中移除模块相关的导入和路由引用
 * @param {string} routerDir - 路由目录路径
 * @param {string} moduleName - 模块名称
 */
function removeRoutesFromConfig(routerDir, moduleName) {
  const possibleRoutesFiles = [
    join(routerDir, 'modules', 'routes.ts'),
    join(routerDir, 'modules', 'route.ts'),
    join(routerDir, 'routes.ts'),
    join(routerDir, 'route.ts'),
    join(routerDir, 'index.ts'),
    join(routerDir, 'router.ts'),
  ]

  let routesPath = null
  possibleRoutesFiles.some((path) => {
    if (existsSync(path)) {
      routesPath = path
      return true
    }
    return false
  })

  if (!routesPath) {
    console.log('⚠️  未找到路由配置文件，跳过路由配置清理')
    return false
  }

  try {
    let routesContent = readFileSync(routesPath, 'utf-8')
    const routeVarName = `${moduleName}Routes`
    let modified = false

    // 移除导入语句（匹配单引号或双引号，可选分号，可能跨行）
    const importPattern = new RegExp(
      `import\\s+${routeVarName}\\s+from\\s+['"]\\.\\/${moduleName}['"];?\\s*\\n?`,
      'g',
    )
    const originalImportLength = routesContent.length
    routesContent = routesContent.replace(importPattern, '')
    if (routesContent.length !== originalImportLength) {
      modified = true
    }

    // 移除路由数组中的引用（匹配 ...routeVarName, 或 ...routeVarName，可能跨行）
    const routeRefPattern = new RegExp(
      `\\s*\\.\\.\\.${routeVarName},?\\s*\\n?`,
      'g',
    )
    const originalRouteLength = routesContent.length
    routesContent = routesContent.replace(routeRefPattern, '')
    if (routesContent.length !== originalRouteLength) {
      modified = true
    }

    // 确保 import 区域后有一个空行
    // 查找所有 import 语句
    const importLines = routesContent.match(
      /^import\s+.*from\s+['"].*['"];?\s*$/gm,
    )
    if (importLines && importLines.length > 0) {
      // 找到最后一个 import 语句的位置
      const lastImport = importLines[importLines.length - 1]
      const lastImportIndex = routesContent.lastIndexOf(lastImport)
      const afterLastImport = routesContent.substring(
        lastImportIndex + lastImport.length,
      )
      // 如果最后一个 import 后没有空行（即直接是其他代码），添加一个空行
      if (
        afterLastImport &&
        !afterLastImport.startsWith('\n\n') &&
        afterLastImport.trim()
      ) {
        const beforeLastImport = routesContent.substring(
          0,
          lastImportIndex + lastImport.length,
        )
        const rest = routesContent.substring(
          lastImportIndex + lastImport.length,
        )
        // 如果 rest 不是以空行开始，添加一个空行
        if (rest && !rest.startsWith('\n\n') && !rest.startsWith('\n//')) {
          routesContent = `${beforeLastImport}\n${rest}`
        }
      }
    }

    // 清理多余的空行（连续三个或更多换行替换为两个换行）
    routesContent = routesContent.replace(/\n{3,}/g, '\n\n')

    if (modified) {
      writeFileSync(routesPath, routesContent, 'utf-8')
      console.log(`✅ 已从路由配置中移除 ${moduleName} 模块的引用`)
      return true
    }
    console.log(`⚠️  路由配置中未找到 ${moduleName} 模块的引用`)
    return false
  } catch (error) {
    console.error(`❌ 更新路由配置时出错: ${error.message}`)
    return false
  }
}

/**
 * 递归删除目录及其所有内容
 * @param {string} dirPath - 目录路径
 */
function removeDirectoryRecursive(dirPath) {
  if (!existsSync(dirPath)) {
    return
  }

  try {
    const items = readdirSync(dirPath)
    items.forEach((item) => {
      const fullPath = join(dirPath, item)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          // 递归删除子目录
          removeDirectoryRecursive(fullPath)
        } else {
          // 删除文件
          rmSync(fullPath, { force: true })
        }
      } catch (error) {
        // 忽略无法访问的文件/目录，但尝试强制删除
        try {
          rmSync(fullPath, { recursive: true, force: true })
        } catch (e) {
          // 忽略删除错误
        }
      }
    })
  } catch (error) {
    // 如果读取目录失败，直接尝试删除整个目录
  }

  // 删除目录本身（包括空目录）
  try {
    rmSync(dirPath, { recursive: true, force: true })
  } catch (error) {
    // 如果删除失败，尝试再次删除
    try {
      rmSync(dirPath, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 100,
      })
    } catch (retryError) {
      // 最后一次尝试：等待一小段时间后再次删除
      setTimeout(() => {
        try {
          rmSync(dirPath, { recursive: true, force: true })
        } catch (finalError) {
          // 忽略最终错误
        }
      }, 200)
    }
  }
}

/**
 * 删除目录（如果存在）
 * @param {string} dirPath - 目录路径
 * @param {string} description - 描述
 * @returns {boolean} 是否删除成功
 */
function deleteDirectory(dirPath, description) {
  if (existsSync(dirPath)) {
    try {
      // 使用递归删除确保删除所有内容
      removeDirectoryRecursive(dirPath)

      // 多次尝试删除，确保完全删除
      let retryCount = 0
      const maxRetries = 5
      while (existsSync(dirPath) && retryCount < maxRetries) {
        try {
          rmSync(dirPath, { recursive: true, force: true })
          // 等待一小段时间让文件系统完成删除操作
          if (retryCount > 0) {
            // 使用同步方式等待（在 Node.js 中可以使用简单的循环延迟）
            const start = Date.now()
            while (Date.now() - start < 100) {
              // 简单的延迟循环
            }
          }
        } catch (retryError) {
          // 忽略重试错误
        }
        retryCount++
      }

      const relativePath = getRelativePath(dirPath)
      if (!existsSync(dirPath)) {
        console.log(`✅ 已删除${description}: ${relativePath}`)
        return true
      }
      console.error(`❌ 删除${description}失败: 文件夹仍然存在 ${relativePath}`)
      return false
    } catch (error) {
      console.error(`❌ 删除${description}失败: ${error.message}`)
      return false
    }
  }
  const relativePath = dirPath.replace(`${projectRoot}/`, '')
  console.log(`⚠️  ${description}不存在: ${relativePath}`)
  return false
}

/**
 * 删除文件（如果存在）
 * @param {string} filePath - 文件路径
 * @param {string} description - 描述
 * @returns {boolean} 是否删除成功
 */
function deleteFile(filePath, description) {
  if (existsSync(filePath)) {
    try {
      rmSync(filePath, { force: true })
      const relativePath = getRelativePath(filePath)
      console.log(`✅ 已删除${description}: ${relativePath}`)
      return true
    } catch (error) {
      console.error(`❌ 删除${description}失败: ${error.message}`)
      return false
    }
  }
  const relativePath = filePath.replace(`${projectRoot}/`, '')
  console.log(`⚠️  ${description}不存在: ${relativePath}`)
  return false
}

/**
 * 查找并删除模块相关文件
 * @param {string} moduleName - 模块名称
 */
async function deleteModuleByName(moduleName) {
  console.log(`\n${'='.repeat(50)}`)
  console.log('🗑️  开始删除模块相关文件...')
  console.log(`${'='.repeat(50)}\n`)

  const normalizedName = normalizeToCamel(moduleName)
  const pascalName = camelToPascal(normalizedName)

  console.log(`📝 模块信息:`)
  console.log(`   模块名称: ${normalizedName}`)
  console.log(`   帕斯卡命名: ${pascalName}\n`)

  // 1. 先清理所有文件中的 import 语句（在删除文件之前）
  const importsCleaned = removeImportsFromAllFiles(normalizedName)

  // 2. 从 routes.ts 中移除引用
  const routerDir = resolve(srcPath, 'router')
  const routesUpdated = removeRoutesFromConfig(routerDir, normalizedName)

  // 3. 删除路由文件
  const routerModulesDir = resolve(srcPath, 'router', 'modules')
  const routeFile = join(routerModulesDir, `${normalizedName}.ts`)
  const routeDeleted = deleteFile(routeFile, '路由文件')

  // 4. 删除 views 目录
  const viewDir = resolve(srcPath, 'views', normalizedName)
  const viewDeleted = deleteDirectory(viewDir, '页面文件夹')

  // 5. 删除 apis 目录
  const apisDir = resolve(srcPath, 'apis', normalizedName)
  const apisDeleted = deleteDirectory(apisDir, 'API文件夹')

  // 统计结果
  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 删除结果统计:')
  console.log('='.repeat(50))
  console.log(
    `   页面文件夹: ${viewDeleted ? '✅ 已删除' : '⚠️  不存在或删除失败'}`,
  )
  console.log(
    `   API文件夹: ${apisDeleted ? '✅ 已删除' : '⚠️  不存在或删除失败'}`,
  )
  console.log(
    `   路由文件: ${routeDeleted ? '✅ 已删除' : '⚠️  不存在或删除失败'}`,
  )
  console.log(
    `   路由配置: ${routesUpdated ? '✅ 已更新' : '⚠️  未更新或未找到引用'}`,
  )
  const importMsg =
    importsCleaned > 0
      ? `✅ 已清理 ${importsCleaned} 个文件`
      : '⚠️  未找到需要清理的 import'
  console.log(`   Import清理: ${importMsg}`)

  const hasDeleted = viewDeleted || apisDeleted || routeDeleted || routesUpdated
  if (hasDeleted) {
    console.log('\n✨ 模块删除完成！')
  } else {
    console.log('\n⚠️  未找到任何相关文件，可能模块不存在或已被删除')
  }
  console.log(`${'='.repeat(50)}\n`)
}

/**
 * 主函数
 */
export async function deleteModule() {
  const rl = createQuestionInterface()

  try {
    console.log(`\n${'='.repeat(50)}`)
    console.log('🗑️  模块删除工具')
    console.log(`${'='.repeat(50)}\n`)

    console.log('⚠️  警告: 此操作将永久删除模块相关的所有文件！')
    console.log('   包括:')
    console.log('   - views/{模块名} 文件夹')
    console.log('   - apis/{模块名} 文件夹')
    console.log('   - router/modules/{模块名}.ts 文件')
    console.log('   - routes.ts 中的相关引用')
    console.log('   - 所有文件中的相关 import 语句\n')

    // 询问模块名称
    let moduleNameInput
    let moduleName
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      moduleNameInput = await askQuestion(
        rl,
        '请输入要删除的模块名称（驼峰命名，如testManage）: ',
        validateModuleName,
      )

      moduleName = normalizeToCamel(moduleNameInput)

      if (moduleNameInput !== moduleName) {
        // eslint-disable-next-line no-await-in-loop
        const confirm = await askYesNo(
          rl,
          `是否使用标准化后的名称 "${moduleName}"？`,
        )
        if (confirm) {
          break
        }
        console.log('')
      } else {
        break
      }
    }

    // 确认删除
    const confirmDelete = await askYesNo(
      rl,
      `\n⚠️  确定要删除模块 "${moduleName}" 的所有相关文件吗？此操作不可恢复！`,
    )

    if (!confirmDelete) {
      console.log('\n❌ 已取消删除操作')
      rl.close()
      return
    }

    // 执行删除
    await deleteModuleByName(moduleName)
  } catch (error) {
    console.error('\n❌ 删除模块时出错:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// 如果直接运行此文件，则执行主函数（用于测试）
// 注意：在 CLI 中通过 import 调用，不会执行这里
if (import.meta.url.endsWith('delete-module.js') && process.argv[1]?.endsWith('delete-module.js')) {
  deleteModule();
}
