const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const repoRoot = path.resolve(__dirname, '..')
const packages = [
  {
    label: 'ts-mobile-ui',
    source: path.join(repoRoot, 'packages', 'components', 'ui'),
    installScript: path.join(repoRoot, 'packages', 'components', 'ui', 'scripts', 'install.js'),
    scope: '@tiansu',
    packageName: 'ts-mobile-ui'
  },
  {
    label: 'ts-mobile-biz-ui',
    source: path.join(repoRoot, 'packages', 'components', 'biz-ui'),
    installScript: path.join(repoRoot, 'packages', 'components', 'biz-ui', 'scripts', 'install.js'),
    scope: '@tiansu',
    packageName: 'ts-mobile-biz-ui'
  },
  {
    label: 'ts-mobile-token',
    source: path.join(repoRoot, 'packages', 'core', 'token', 'dist'),
    scope: '@tiansu',
    packageName: 'ts-mobile-token'
  }
]

const projects = [
  {
    name: 'uniapp-project',
    projectRoot: path.join(repoRoot, 'apps', 'playground', 'uniapp-project'),
    uniModulesRoot: path.join(repoRoot, 'apps', 'playground', 'uniapp-project', 'src', 'uni_modules')
  },
  {
    name: 'uniapp-x-project',
    projectRoot: path.join(repoRoot, 'apps', 'playground', 'uniapp-x-project'),
    uniModulesRoot: path.join(repoRoot, 'apps', 'playground', 'uniapp-x-project', 'uni_modules')
  }
]

const mode = process.argv.includes('--restore')
  ? 'restore'
  : process.argv.includes('--unlink')
    ? 'unlink'
    : 'link'
const isDryRun = process.argv.includes('--dry-run')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function removeTarget(targetPath) {
  if (!fs.existsSync(targetPath)) return
  fs.rmSync(targetPath, { recursive: true, force: true })
}

function createSymlink(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath))
  const relativeSource = path.relative(path.dirname(targetPath), sourcePath)
  fs.symlinkSync(relativeSource, targetPath, 'junction')
}

function restoreFromDist(projectRoot, targetPath, installScript) {
  removeTarget(targetPath)
  execFileSync(process.execPath, [installScript], {
    cwd: projectRoot,
    env: {
      ...process.env,
      INIT_CWD: projectRoot
    },
    stdio: 'inherit'
  })
}

for (const project of projects) {
  for (const pkg of packages) {
    const target = path.join(project.uniModulesRoot, pkg.scope, pkg.packageName)
    const action = mode === 'link' ? 'link' : mode === 'restore' ? 'restore' : 'unlink'
    if (isDryRun) {
      console.log(`[dry-run] ${project.name}: ${action} ${pkg.label} -> ${target}`)
      continue
    }

    if (mode === 'link') {
      removeTarget(target)
      createSymlink(pkg.source, target)
      console.log(`✅ ${project.name}: linked ${pkg.label} to ${pkg.source}`)
      continue
    }

    if (mode === 'unlink') {
      removeTarget(target)
      console.log(`✅ ${project.name}: unlinked ${pkg.label}`)
      continue
    }

    restoreFromDist(project.projectRoot, target, pkg.installScript)
    console.log(`✅ ${project.name}: restored ${pkg.label} from dist`)
  }
}

// 执行 npx -y @tiansu/ts-icon 命令
projects.forEach(project => {
  console.log(`[ts-icon] Installing to ${project.name}...`);
  try {
    execFileSync('sh', ['-c', `cd "${project.projectRoot}" && npx -y @tiansu/ts-icon@0.0.23`], { stdio: 'inherit' });
  } catch (error) {
    console.error(`[ts-icon] Failed to install in ${project.name}: ${error.message}`);
  }
});

