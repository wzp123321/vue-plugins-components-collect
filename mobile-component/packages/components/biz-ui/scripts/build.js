const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function clean() {
  if (fs.existsSync(distPath)) {
    execSync(`rm -rf "${distPath}"`);
  }
  fs.mkdirSync(distPath, { recursive: true });
}

function syncSourceToDist() {
  console.log('[Build] Sync sources to dist...');
  fs.mkdirSync(distPath, { recursive: true });
  execSync(
    `rsync -aq --exclude='node_modules' --exclude='dist' --exclude='scripts' --exclude='rollup.config.mjs' --exclude='uniapp-x/uts-libs' "${packageRoot}/" "${distPath}/"`
  );
}

function syncUtsLibs() {
  if (!fs.existsSync(utsLibsSrc)) return;

  const libs = fs.readdirSync(utsLibsSrc).filter(n => fs.statSync(path.join(utsLibsSrc, n)).isDirectory());
  libs.forEach(lib => {
    const src = path.join(utsLibsSrc, lib);
    const dest = path.join(distPath, lib);
    execSync(`rsync -aq "${src}/" "${dest}/"`);
  });
}

function main() {
  clean();
  syncSourceToDist();
  syncUtsLibs();
  console.log('[Build] Done.');
}

main();
