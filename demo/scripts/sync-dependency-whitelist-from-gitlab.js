import fs from 'node:fs/promises'
import path from 'node:path'

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json')

function uniqSorted(list) {
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b))
}

function parseArgs(argv) {
  const args = { dryRun: false, stdout: false, help: false }
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--stdout') args.stdout = true
    else if (a === '--help' || a === '-h') args.help = true
  }
  return args
}

function usage(exitCode) {
  const lines = [
    '用法：node ./scripts/sync-dependency-whitelist-from-gitlab.js [--dry-run] [--stdout]',
    '',
    '方式 A（推荐）：指定 WHITELIST_URL（GitLab raw 或 API raw 均可）',
    '  WHITELIST_URL=https://gitlab.example.com/api/v4/projects/<id>/repository/files/<file>/raw?ref=main',
    '  GITLAB_TOKEN=<token> (可选，PRIVATE-TOKEN)',
    '  CI_JOB_TOKEN=<token> (可选，JOB-TOKEN)',
    '',
    '方式 B：指定项目与文件（脚本会拼接 GitLab API raw URL）',
    '  GITLAB_BASE_URL=https://gitlab.com',
    '  GITLAB_PROJECT_ID=123 或 GITLAB_PROJECT_PATH=group/subgroup/repo',
    '  GITLAB_REF=main (默认 main)',
    '  GITLAB_FILE_PATH=dependency-whitelist.json (默认 dependency-whitelist.json)',
    '  GITLAB_TOKEN=<token> (可选，PRIVATE-TOKEN) 或 CI_JOB_TOKEN=<token> (JOB-TOKEN)',
    '',
    '白名单文件格式支持：',
    '  - JSON 数组：["vue","vite"]',
    '  - JSON 对象：{"dependencyWhitelist":["vue","vite"]}',
    '  - 文本每行一个包名（支持 # 注释行）'
  ]
  console.error(lines.join('\n'))
  process.exit(exitCode)
}

function getAuthHeaders() {
  const token = process.env.GITLAB_TOKEN
  if (token) return { 'PRIVATE-TOKEN': token }
  const jobToken = process.env.CI_JOB_TOKEN
  if (jobToken) return { 'JOB-TOKEN': jobToken }
  return {}
}

function buildGitlabRawUrl() {
  const direct = process.env.WHITELIST_URL
  if (direct && direct.trim().length > 0) return direct.trim()

  const base = (process.env.GITLAB_BASE_URL || 'https://gitlab.com').replace(/\/+$/, '')
  const projectId = process.env.GITLAB_PROJECT_ID
  const projectPath = process.env.GITLAB_PROJECT_PATH
  const ref = process.env.GITLAB_REF || 'main'
  const filePath = process.env.GITLAB_FILE_PATH || 'dependency-whitelist.json'

  const project = projectId && projectId.trim().length > 0 ? projectId.trim() : projectPath
  if (!project || project.trim().length === 0) return null

  const url =
    `${base}/api/v4/projects/${encodeURIComponent(project)}` +
    `/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(ref)}`
  return url
}

function parseWhitelistContent(text) {
  const trimmed = text.trim()
  if (trimmed.length === 0) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.dependencyWhitelist)) return parsed.dependencyWhitelist
  } catch {
    // ignore
  }

  return trimmed
    .split(/\r?\n/g)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
}

function isValidPackageName(name) {
  if (typeof name !== 'string') return false
  const n = name.trim()
  if (n.length === 0) return false
  if (/\s/.test(n)) return false
  return true
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) usage(0)

  const url = buildGitlabRawUrl()
  if (!url) usage(1)

  const res = await fetch(url, { headers: { ...getAuthHeaders() } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`拉取白名单失败：HTTP ${res.status} ${res.statusText}\n${body}`)
  }

  const body = await res.text()
  const rawList = parseWhitelistContent(body)
  const list = uniqSorted(rawList.map(x => (typeof x === 'string' ? x.trim() : x)).filter(Boolean))

  const invalid = list.filter(name => !isValidPackageName(name))
  if (invalid.length > 0) {
    throw new Error(['白名单内容存在非法项：', ...invalid.map(x => `- ${String(x)}`)].join('\n'))
  }

  if (args.stdout) {
    process.stdout.write(JSON.stringify(list, null, 2) + '\n')
    return
  }

  const packageJson = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, 'utf-8'))
  packageJson.dependencyWhitelist = list

  if (args.dryRun) {
    process.stdout.write(JSON.stringify(packageJson.dependencyWhitelist, null, 2) + '\n')
    return
  }

  await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')
  process.stdout.write(`已同步白名单：${list.length} 项\n`)
}

await main()
