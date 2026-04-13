#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (exclude.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyDir(s, d, exclude);
    } else if (stat.isSymbolicLink()) {
      const real = fs.realpathSync(s);
      const realStat = fs.statSync(real);
      if (realStat.isDirectory()) {
        copyDir(real, d, exclude);
      } else {
        fs.copyFileSync(real, d);
      }
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function rimraf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function main() {
  const projectRoot = process.env.INIT_CWD || process.cwd();
  const srcDir = path.join(projectRoot, 'src');
  const uniModulesBase = fs.existsSync(srcDir)
    ? path.join(srcDir, 'uni_modules')
    : path.join(projectRoot, 'uni_modules');
  const targetPkgDir = path.join(uniModulesBase, '@tiansu/ts-mobile-token');
  const pkgRoot = path.resolve(__dirname, '..');
  const distDir = path.join(pkgRoot, 'dist');
  const pkgJsonPath = path.join(pkgRoot, 'package.json');

  try {
    if (!fs.existsSync(distDir)) throw new Error('dist not found. Please run build before install.');
    if (!fs.existsSync(uniModulesBase)) fs.mkdirSync(uniModulesBase, { recursive: true });
    rimraf(targetPkgDir);
    fs.mkdirSync(targetPkgDir, { recursive: true });
    copyDir(distDir, targetPkgDir);
    if (fs.existsSync(pkgJsonPath)) {
      fs.copyFileSync(pkgJsonPath, path.join(targetPkgDir, 'package.json'));
    }
    console.log(`[ts-mobile-token] Installed to ${targetPkgDir}`);
  } catch (e) {
    console.error('[ts-mobile-token] Installation failed:', e.message);
    process.exit(1);
  }
}

main();
