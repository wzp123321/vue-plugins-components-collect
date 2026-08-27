const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')
const { platform } = require('os')

const isWindows = platform() === 'win32'

const repoRoot = path.resolve(__dirname, '..')
const packages = [
  {
    label: 'ts-mobile-ui',
    source: path.join(repoRoot, 'packages', 'components', 'ui'),
    dist: path.join(repoRoot, 'packages', 'components', 'ui', 'dist'),
    scope: '@tiansu',
    packageName: 'ts-mobile-ui'
  },
  {
    label: 'ts-mobile-biz-ui',
    source: path.join(repoRoot, 'packages', 'components', 'biz-ui'),
    dist: path.join(repoRoot, 'packages', 'components', 'biz-ui', 'dist'),
    scope: '@tiansu',
    packageName: 'ts-mobile-biz-ui'
  },
  {
    label: 'ts-mobile-token',
    source: path.join(repoRoot, 'packages', 'core', 'token', 'dist'),
    dist: path.join(repoRoot, 'packages', 'core', 'token', 'dist'),
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
  : process.argv.includes('--remote')
    ? 'remote'
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
  fs.symlinkSync(relativeSource, targetPath, isWindows ? 'junction' : 'dir')
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

for (const project of projects) {
  if (mode === 'link') {
    const scopeDir = path.join(project.uniModulesRoot, '@tiansu')
    removeTarget(scopeDir)
  }

  for (const pkg of packages) {
    const target = path.join(project.uniModulesRoot, pkg.scope, pkg.packageName)
    const action = mode === 'link' ? 'link' : mode === 'restore' ? 'restore' : 'remote'
    if (isDryRun) {
      console.log(`[dry-run] ${project.name}: ${action} ${pkg.label} -> ${target}`)
      continue
    }

    if (mode === 'link') {
      createSymlink(pkg.source, target)
      console.log(`✅ ${project.name}: linked ${pkg.label} to ${pkg.source}`)
      continue
    }

    if (mode === 'remote') {
      removeTarget(target)
      console.log(`✅ ${project.name}: unlinked ${pkg.label}`)
      continue
    }

    copyFromDist(pkg.dist, target)
    console.log(`✅ ${project.name}: copied ${pkg.label} from dist`)
  }
}

projects.forEach(project => {
  if (mode === 'remote') {
    console.log(`[remote] ${project.name}: pnpm rebuild @tiansu/ts-mobile-installer...`)
    try {
      execSync(`cd "${project.projectRoot}" && pnpm rebuild @tiansu/ts-mobile-installer`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`[remote] ${project.name}: failed: ${error.message}`)
    }
  } else {
    const projectDepsPath = path.join(project.projectRoot, 'uni.dependencies.json')
    let tsIconVersion = 'latest'
    if (fs.existsSync(projectDepsPath)) {
      const projectDeps = JSON.parse(fs.readFileSync(projectDepsPath, 'utf-8'))
      const versionRange = projectDeps['@tiansu/ts-icon']
      if (versionRange) {
        try {
          tsIconVersion = execSync(`npm view @tiansu/ts-icon@${versionRange} version`, { stdio: 'pipe' }).toString().trim()
        } catch (_) {
          console.error(`[ts-icon] Failed to resolve version for @tiansu/ts-icon@${versionRange}, falling back to latest`)
        }
      }
    }
    console.log(`[ts-icon] Installing @tiansu/ts-icon@${tsIconVersion} to ${project.name}...`)
    try {
      const tarballUrl = execSync(`npm view @tiansu/ts-icon@${tsIconVersion} dist.tarball`, { stdio: 'pipe' }).toString().trim()
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-icon-'))
      const tgzPath = path.join(tmpDir, 'package.tgz')
      const curlCmd = isWindows ? 'curl.exe' : 'curl'
      execSync(`${curlCmd} -fsSL -o "${tgzPath}" "${tarballUrl}"`, { stdio: 'inherit' })
      execSync(`tar -xzf "${tgzPath}" -C "${tmpDir}"`, { stdio: 'inherit' })
      const pkgJson = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package', 'package.json'), 'utf-8'))
      const binPath = typeof pkgJson.bin === 'string' ? pkgJson.bin : pkgJson.bin[Object.keys(pkgJson.bin)[0]]
      execSync(`node "${path.join(tmpDir, 'package', binPath)}"`, {
        cwd: project.projectRoot,
        env: { ...process.env, INIT_CWD: project.projectRoot },
        stdio: 'inherit'
      })
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch (error) {
      console.error(`[ts-icon] Failed to install in ${project.name}: ${error.message}`)
    }
  }
})
