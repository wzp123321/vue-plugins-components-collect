const fs = require('fs');
const path = require('path');

/**
 * Build script for phillUI
 * 1. Clean dist
 * 2. Sync package sources to dist (exclude node_modules, scripts, dist)
 */

const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'));
const distPath = path.join(packageRoot, 'dist');

const EXCLUDES = new Set(['node_modules', 'dist', 'scripts']);

function clean() {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  fs.mkdirSync(distPath, { recursive: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDES.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncSourceToDist() {
  console.log('[Build] Sync sources to dist...');
  fs.mkdirSync(distPath, { recursive: true });
  copyDir(packageRoot, distPath);
}

function main() {
  clean();
  syncSourceToDist();
  console.log('[Build] Done.');
}

main();
