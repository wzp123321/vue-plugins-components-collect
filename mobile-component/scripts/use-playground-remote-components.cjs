const path = require('path')
const { execSync } = require('child_process')

const repoRoot = path.resolve(__dirname, '..')
const isDryRun = process.argv.includes('--dry-run')

const projects = [
  path.join(repoRoot, 'apps', 'playground', 'uniapp-project'),
  path.join(repoRoot, 'apps', 'playground', 'uniapp-x-project')
]

const installCommands = [
  'npx -y @tiansu/ts-mobile-ui',
  'npx -y @tiansu/ts-mobile-biz-ui'
]

function run(command, cwd) {
  if (isDryRun) {
    console.log(`[dry-run] (${cwd}) ${command}`)
    return
  }
  execSync(command, { cwd, stdio: 'inherit' })
}

run('node scripts/link-playground-components.cjs --unlink', repoRoot)

for (const projectRoot of projects) {
  for (const command of installCommands) {
    run(command, projectRoot)
  }
}

console.log('✅ playground 已切换为远端组件安装模式')
