const fs = require('fs');
const path = require('path');

/**
 * Build script for phillUI
 * 1. Clean dist
 * 2. Sync package sources to dist (exclude node_modules, scripts, dist)
 * 3. Sync uts-libs to dist root if exists
 */

const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'));
const distPath = path.join(packageRoot, 'dist');
const utsLibsSrc = path.join(packageRoot, 'uniapp-x', 'uts-libs');

const SOURCE_EXCLUDES = new Set(['node_modules', 'dist', 'scripts', 'rollup.config.mjs', 'uniapp-x']);

function clean() {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  fs.mkdirSync(distPath, { recursive: true });
}

function copyDir(src, dest, excludes = new Set()) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (excludes.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncSourceToDist() {
  console.log('[Build] Sync sources to dist...');
  fs.mkdirSync(distPath, { recursive: true });
  copyDir(packageRoot, distPath, SOURCE_EXCLUDES);
}

function syncUtsLibs() {
  if (!fs.existsSync(utsLibsSrc)) return;

  const libs = fs.readdirSync(utsLibsSrc).filter(n => fs.statSync(path.join(utsLibsSrc, n)).isDirectory());
  libs.forEach(lib => {
    const src = path.join(utsLibsSrc, lib);
    const dest = path.join(distPath, lib);
    copyDir(src, dest);
  });
}

function main() {
  clean();
  syncSourceToDist();
  syncUtsLibs();
  console.log('[Build] Done.');
}

main();
