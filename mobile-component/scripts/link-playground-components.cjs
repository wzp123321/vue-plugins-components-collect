const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { platform } = require('os')

const isWindows = platform() === 'win32'

const repoRoot = path.resolve(__dirname, '..')
const packages = [
  {
    label: 'ts-mobile-ui',
    source: path.join(repoRoot, 'packages', 'components', 'ui'),
    dist: path.join(repoRoot, 'packages', 'components', 'ui', 'dist'),
    installScript: path.join(repoRoot, 'packages', 'components', 'ui', 'scripts', 'install.js'),
    scope: '@tiansu',
    packageName: 'ts-mobile-ui'
  },
  {
    label: 'ts-mobile-biz-ui',
    source: path.join(repoRoot, 'packages', 'components', 'biz-ui'),
    dist: path.join(repoRoot, 'packages', 'components', 'biz-ui', 'dist'),
    installScript: path.join(repoRoot, 'packages', 'components', 'biz-ui', 'scripts', 'install.js'),
    scope: '@tiansu',
    packageName: 'ts-mobile-biz-ui'
  },
  {
    label: 'ts-mobile-token',
    source: path.join(repoRoot, 'packages', 'core', 'token', 'dist'),
    dist: path.join(repoRoot, 'packages', 'core', 'token', 'dist'),
    installScript: path.join(repoRoot, 'packages', 'core', 'token', 'scripts', 'install.js'),
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

function copyFromDist(sourceDist, targetPath) {
  removeTarget(targetPath)
  ensureDir(path.dirname(targetPath))
  copyDir(sourceDist, targetPath)
}

function copyDir(src, dest) {
  ensureDir(dest)
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function installDependenciesInPackage(packagePath, projectName, packageLabel) {
  const packageJsonPath = path.join(packagePath, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`[${projectName}] ⏭️  ${packageLabel} has no package.json, skipping install`)
    return
  }
  console.log(`[${projectName}] Installing dependencies for ${packageLabel} in ${packagePath}...`)
  try {
    if (isWindows) {
      execFileSync(process.execPath, ['-e', `require('child_process').execSync('npm install', { cwd: "${packagePath}", stdio: 'inherit', shell: true })`], {
        cwd: projectName,
        stdio: 'inherit',
        shell: true
      })
    } else {
      execFileSync('sh', ['-c', `cd "${packagePath}" && npm install`], {
        stdio: 'inherit'
      })
    }
    console.log(`[${projectName}] ✅ ${packageLabel} dependencies installed successfully`)
  } catch (error) {
    console.error(`[${projectName}] ❌ Failed to install ${packageLabel} dependencies: ${error.message}`)
  }

  const lockFiles = ['package-lock.json', 'pnpm-lock.yaml']
  for (const lockFile of lockFiles) {
    const lockPath = path.join(projectName, lockFile)
    if (fs.existsSync(lockPath)) {
      fs.rmSync(lockPath)
      console.log(`[${projectName}] 🗑️  Removed auto-generated ${lockFile}`)
    }
  }
}

function installDependenciesInUniModules(project) {
  if (mode !== 'restore') return

  for (const pkg of packages) {
    const targetPath = path.join(project.uniModulesRoot, pkg.scope, pkg.packageName)
    installDependenciesInPackage(targetPath, project.name, pkg.label)
  }
}

for (const project of projects) {
  if (mode === 'link') {
    const scopeDir = path.join(project.uniModulesRoot, '@tiansu')
    removeTarget(scopeDir)
  }

  for (const pkg of packages) {
    const target = path.join(project.uniModulesRoot, pkg.scope, pkg.packageName)
    const action = mode === 'link' ? 'link' : mode === 'restore' ? 'restore' : 'unlink'
    if (isDryRun) {
      console.log(`[dry-run] ${project.name}: ${action} ${pkg.label} -> ${target}`)
      continue
    }

    if (mode === 'link') {
      createSymlink(pkg.source, target)
      console.log(`✅ ${project.name}: linked ${pkg.label} to ${pkg.source}`)
      continue
    }

    if (mode === 'unlink') {
      removeTarget(target)
      console.log(`✅ ${project.name}: unlinked ${pkg.label}`)
      continue
    }

    copyFromDist(pkg.dist, target)
    console.log(`✅ ${project.name}: copied ${pkg.label} from dist`)
  }

  installDependenciesInUniModules(project)
}

projects.forEach(project => {
  console.log(`[ts-icon] Installing to ${project.name}...`)
  try {
    if (isWindows) {
      execFileSync('npx', ['-y', '@tiansu/ts-icon@latest'], {
        cwd: project.projectRoot,
        stdio: 'inherit',
        shell: true
      })
    } else {
      execFileSync('sh', ['-c', `cd "${project.projectRoot}" && npx -y @tiansu/ts-icon@latest`], { stdio: 'inherit' })
    }
  } catch (error) {
    console.error(`[ts-icon] Failed to install in ${project.name}: ${error.message}`)
  }
})
