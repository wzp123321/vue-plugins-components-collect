const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

function cleanDist() {
  if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function build() {
  cleanDist()

  copyFile(path.join(rootDir, 'bin.js'), path.join(distDir, 'bin.js'))
  copyFile(path.join(rootDir, 'uni.dependencies.json'), path.join(distDir, 'uni.dependencies.json'))

  console.log('[ts-mobile-installer] Build complete')
}

build()
