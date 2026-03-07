import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

/**
 * 依赖白名单强制脚本（配合 npm lifecycle scripts 使用）
 *
 * 目标：
 * 1) 维护一份依赖白名单（package.json#dependencyWhitelist）
 * 2) 在执行 npm install / npm ci 时，校验 package.json#dependencies 是否存在非白名单依赖
 *    - 若存在：提示、自动移除（uninstall + prune），并使本次安装失败
 * 3) 在执行 npm install <pkg> / npm i <pkg> 时，尽可能获取命令入参并校验是否在白名单
 *    - 注意：npm v7+ 的行为是“npm install <pkg> 不一定会触发项目根的 preinstall”
 *      因此该脚本对第 3 点的覆盖取决于 npm 是否触发 lifecycle。
 */

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json') // 当前项目的 package.json 绝对路径

/**
 * 内部防重入标记：
 * - 当脚本检测到非法依赖后，会主动调用 npm uninstall/prune
 * - 这些命令本身也可能触发 lifecycle scripts
 * - 通过注入环境变量避免递归调用导致死循环
 */
const INTERNAL_ENV_FLAG = 'DEPENDENCY_WHITELIST_INTERNAL' // 防止脚本递归触发的内部环境变量键

/**
 * 统一的步骤日志前缀
 */
function logStep(message, extra) {
  const prefix = '[dep-whitelist]'
  if (extra !== undefined) {
    console.log(prefix, message, extra)
  } else {
    console.log(prefix, message)
  }
}

/**
 * 去重并排序，保证输出稳定，方便排查与 CI diff。
 */
function uniqSorted(list) {
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b))
}

/**
 * 从 npm 注入的 npm_config_argv 中解析出用户在命令行输入的安装包规格。
 *
 * npm_config_argv 形如：
 * {
 *   "original": ["install", "lodash", "--save-dev"],
 *   "cooked":   ["install", "lodash", "--save-dev"]
 * }
 *
 * 这里只处理 install / i / add / ci 等命令，并过滤掉以 "-" 开头的参数。
 */
function parseNpmCliSpecs() {
  const raw = process.env.npm_config_argv
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.original)) return []
    const original = parsed.original
    if (original.length === 0) return []
    const [command, ...rest] = original
    if (!['install', 'i', 'add', 'ci'].includes(command)) return []
    return rest.filter(arg => typeof arg === 'string' && arg.length > 0 && !arg.startsWith('-'))
  } catch {
    return []
  }
}

/**
 * 获取 npm 当前的生命周期事件名。
 *
 * @returns {string} 当前 lifecycle 名称；若不可用则返回空字符串
 * 常见：
 * - preinstall：执行 npm install / npm ci 时通常会触发
 * - dependencies：当 node_modules 发生变更后会触发（npm v10 文档）
 */
function getLifecycleEvent() {
  return typeof process.env.npm_lifecycle_event === 'string' ? process.env.npm_lifecycle_event : ''
}

/**
 * 从安装规格中提取包名（忽略版本/tag）。
 *
 * @param {string} spec 安装规格（如 lodash、lodash@^4、@scope/pkg、npm:@scope/pkg@^1）
 * @returns {string|null} 提取出的包名；无法提取时返回 null
 * 支持：
 * - lodash
 * - lodash@^4
 * - @scope/pkg
 * - @scope/pkg@^1
 * - npm:@scope/pkg@^1（alias 前缀 npm:）
 *
 * 不尝试解析 URL/git/file/workspace 等复杂 spec，因为该脚本的策略是“只允许 registry 包名”。
 */
function extractPackageName(spec) {
  const cleaned = spec.startsWith('npm:') ? spec.slice('npm:'.length) : spec
  if (cleaned.startsWith('@')) {
    const slash = cleaned.indexOf('/')
    if (slash === -1) return null
    const at = cleaned.lastIndexOf('@')
    if (at > slash) return cleaned.slice(0, at)
    return cleaned
  }

  const at = cleaned.indexOf('@')
  if (at > 0) return cleaned.slice(0, at)
  return cleaned
}

/**
 * 白名单规则：
 * - 精确匹配： "vue"
 * - scope 前缀匹配： "@types/*"
 *
 * @param {string} packageName 包名
 * @param {string[]} whitelist 白名单规则
 * @returns {boolean} 是否允许
 */
function isAllowed(packageName, whitelist) {
  for (const rule of whitelist) {
    if (rule === packageName) return true
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1)
      if (packageName.startsWith(prefix)) return true
    }
  }
  return false
}

/**
 * Windows 下 npm 可执行文件是 npm.cmd；其他平台一般为 npm。
 */
function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

/**
 * 在脚本内同步执行 npm 子命令（uninstall/prune），并做到：
 * - 继承 stdio，便于用户看到 npm 的真实输出
 * - 注入 INTERNAL_ENV_FLAG，避免递归触发本脚本
 * - 强制 ignore-scripts，避免执行依赖包的 postinstall 等脚本（降低副作用）
 *
 * 使用 npm_execpath/npm_node_execpath：
 * - 在 npm 生命周期脚本环境中，npm 会注入 npm_execpath（指向 npm-cli.js）
 * - 直接执行 "npm" 在某些环境下可能找不到/或与当前 npm 版本不一致
 * - 因此优先使用 node + npm_execpath 来执行 npm 子命令，保证一致性
 *
 * @param {string[]} args 要执行的 npm 子命令及参数（如 ['uninstall','pkg']）
 * @throws {Error} 当子命令非 0 退出或底层出错时抛出
 */
function runNpm(args) {
  const npmExecPath = typeof process.env.npm_execpath === 'string' ? process.env.npm_execpath : '' // npm-cli.js 路径（若存在）
  const nodeExecPath =
    typeof process.env.npm_node_execpath === 'string' && process.env.npm_node_execpath.length > 0
      ? process.env.npm_node_execpath // npm 注入的 node 可执行路径
      : process.execPath // 兜底使用当前进程的 node

  const command = npmExecPath ? nodeExecPath : npmCommand() // 优先 node + npm_execpath
  const commandArgs = npmExecPath ? [npmExecPath, ...args] : args // 参数列表

  logStep('执行 npm 子命令', [command, ...commandArgs].join(' '))

  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      [INTERNAL_ENV_FLAG]: '1',
      npm_config_ignore_scripts: 'true',
      NPM_CONFIG_IGNORE_SCRIPTS: 'true'
    }
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`npm ${args.join(' ')} 执行失败`)
  }
}

/**
 * 格式化错误输出，保持单行 `- item` 形式，便于复制/粘贴与 CI 阅读。
 *
 * @param {string} title 标题行
 * @param {string[]} items 明细项
 * @returns {string} 拼接后的多行字符串
 */
function formatErrorLines(title, items) {
  return [title, ...uniqSorted(items).map(d => `- ${d}`)].join('\n')
}

/**
 * 防止脚本在自触发的 npm 子命令中再次运行（避免死循环）。
 */
if (process.env[INTERNAL_ENV_FLAG] === '1') process.exit(0)

const lifecycleEvent = getLifecycleEvent() // 当前 npm 生命周期事件名
logStep('启动依赖白名单校验', `lifecycle=${lifecycleEvent || 'n/a'}`)

/**
 * 触发场景：
 * - lifecycleEvent=preinstall：npm install/npm ci 等通常会触发
 * - lifecycleEvent=dependencies：npm 在 node_modules 发生变化后触发（可用于兜底）
 */
const isInstallLifecycle = lifecycleEvent === 'preinstall' || lifecycleEvent === 'dependencies' // 是否处于安装相关生命周期

/**
 * cliSpecs：用户在命令行 `npm install <pkg>` 里指定的包规格。
 * 注意 npm v7+ 可能不会触发项目根 lifecycle，因此 cliSpecs 只有在 lifecycle 被触发时才可用。
 */
const cliSpecs = parseNpmCliSpecs() // 命令行指定的安装规格（仅在 lifecycle 被触发时可用）
if (cliSpecs.length > 0) {
  logStep('解析到命令行安装规格', JSON.stringify(cliSpecs))
}

/**
 * 既不是安装生命周期，也没有解析到命令行指定包，说明本次无需校验（直接跳过）。
 */
if (!isInstallLifecycle && cliSpecs.length === 0) process.exit(0)

logStep('读取 package.json 并获取白名单')
const packageJson = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, 'utf-8')) // 读取后的 package.json 对象
const whitelist = Array.isArray(packageJson.dependencyWhitelist) ? packageJson.dependencyWhitelist : null // 白名单数组

/**
 * 未配置白名单则直接失败，避免“白名单缺失导致放行”的隐患。
 */
if (!whitelist || whitelist.length === 0) {
  logStep('未检测到白名单配置 dependencyWhitelist，准备失败退出')
  console.error(
    [
      '依赖白名单校验失败：未配置 package.json#dependencyWhitelist',
      '请在 package.json 中新增字段 dependencyWhitelist（数组），列出允许安装的依赖名，例如：',
      '  "dependencyWhitelist": ["vue", "@types/node", "@vitejs/plugin-vue"]',
      '【如需安装，请联系架构部补充白名单】'
    ].join('\n')
  )
  process.exit(1)
}

/**
 * 需求：仅校验 package.json#dependencies（不校验 devDependencies）
 * - forbiddenInDependencies：当前 dependencies 中不在白名单内的依赖
 */
const currentDeps = Object.keys(packageJson.dependencies ?? {}) // dependencies 的键集合
const forbiddenInDependencies = currentDeps.filter(name => !isAllowed(name, whitelist)) // 非白名单依赖（来自 dependencies）
logStep('分析 dependencies', `总数=${currentDeps.length}, 非白名单=${forbiddenInDependencies.length}`)

/**
 * forbiddenRequested：用户这次命令指定安装的依赖中，不在白名单内的依赖
 * - 解析自 npm_config_argv，仅能覆盖到 lifecycle 被触发的情况
 */
const requestedNames = [] // 本次命令行请求安装的包名集合
for (const spec of cliSpecs) {
  const name = extractPackageName(spec)
  if (name) requestedNames.push(name)
}
const forbiddenRequested = requestedNames.filter(name => !isAllowed(name, whitelist)) // 非白名单依赖（来自命令行）
if (requestedNames.length > 0) {
  logStep('分析命令请求安装的依赖', `非白名单=${forbiddenRequested.length}`)
}

/**
 * 若无违规项则放行。
 */
if (forbiddenInDependencies.length === 0 && forbiddenRequested.length === 0) process.exit(0)

logStep('发现非白名单依赖，准备执行清理')
/**
 * 先输出错误信息，再做清理动作：
 * - 让用户明确“为什么失败/哪些包不允许”
 * - 清理后再以非 0 退出，阻止本次安装流程继续
 */
console.error(
  [
    '依赖白名单校验失败：检测到未在白名单内的依赖，已尝试自动移除并阻止安装。',
    forbiddenInDependencies.length > 0 ? formatErrorLines('package.json#dependencies 未在白名单内：', forbiddenInDependencies) : null,
    forbiddenRequested.length > 0 ? formatErrorLines('本次 npm install 指定的依赖未在白名单内：', forbiddenRequested) : null,
    '',
    '如需安装，请先将依赖名加入 package.json#dependencyWhitelist。【如需安装，请联系架构部补充白名单】'
  ]
    .filter(Boolean)
    .join('\n\n')
)

try {
  const namesAll = uniqSorted([...new Set([...forbiddenInDependencies, ...forbiddenRequested])]) // 所有需要移除的非法依赖名
  logStep('需移除的依赖列表', JSON.stringify(namesAll))

  let pkgChanged = false // 是否修改了 package.json 的 dependencies
  if (packageJson.dependencies) {
    for (const name of namesAll) {
      if (Object.prototype.hasOwnProperty.call(packageJson.dependencies, name)) {
        delete packageJson.dependencies[name]
        pkgChanged = true
      }
    }
  }
  if (pkgChanged) {
    logStep('更新 package.json，移除非白名单依赖')
    await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')
  }

  if (namesAll.length > 0) {
    /**
     * 针对 Windows 上偶发的 EBUSY 文件占用问题：
     * - 逐个卸载，避免一次性卸载失败导致后续包不处理
     * - 每个包最多重试 3 次；失败则尝试强制删除 node_modules/<pkg> 目录
     */
    const sleep = ms => new Promise(res => setTimeout(res, ms)) // 简易延迟函数
    const pkgDir = name => path.join(process.cwd(), 'node_modules', name) // 包目录路径
    const tryForceRemove = async name => {
      try {
        await fs.rm(pkgDir(name), { recursive: true, force: true })
      } catch {
        // ignore
      }
    }

    logStep('开始卸载非白名单依赖（逐个处理以提升稳定性）')
    for (const name of namesAll) {
      let ok = false // 单个包卸载是否成功
      for (let i = 0; i < 3 && !ok; i++) {
        logStep('卸载依赖重试', `${name} 第 ${i + 1}/3 次`)
        // 最多重试 3 次
        try {
          runNpm(['uninstall', name, '--no-save', '--ignore-scripts'])
          ok = true
        } catch {
          if (i < 2) {
            await sleep(600)
          }
        }
      }
      if (!ok) {
        logStep('卸载失败，尝试强制删除目录', pkgDir(name))
        await tryForceRemove(name)
      }
    }
    logStep('执行 npm prune 清理多余依赖')
  }
  runNpm(['prune', '--ignore-scripts'])
} catch {
  process.exit(1)
}

logStep('已完成清理并阻止安装，准备以错误码退出')
process.exit(1)
