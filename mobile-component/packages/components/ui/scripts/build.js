const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build script for phillUI
 * 1. Clean dist
 * 2. Sync package sources to dist (exclude node_modules, scripts, dist)
 */

const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'));
const distPath = path.join(packageRoot, 'dist');

function clean() {
  if (fs.existsSync(distPath)) {
    execSync(`rm -rf "${distPath}"`);
  }
  fs.mkdirSync(distPath, { recursive: true });
}

function syncSourceToDist() {
  console.log('[Build] Sync sources to dist...');
  fs.mkdirSync(distPath, { recursive: true });
  execSync(`rsync -aq --exclude='node_modules' --exclude='dist' --exclude='scripts' "${packageRoot}/" "${distPath}/"`);
}

function main() {
  clean();
  syncSourceToDist();
  console.log('[Build] Done.');
}

main();
