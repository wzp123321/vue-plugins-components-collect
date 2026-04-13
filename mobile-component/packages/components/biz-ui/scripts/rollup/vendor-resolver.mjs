import fs from 'node:fs';
import path from 'node:path';

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addCandidate(candidates, value) {
  if (typeof value !== 'string' || !value.trim()) return;
  candidates.push(value.trim());
}

function collectExportCandidates(exportsField, candidates) {
  if (!exportsField) return;

  if (typeof exportsField === 'string') {
    addCandidate(candidates, exportsField);
    return;
  }

  if (Array.isArray(exportsField)) {
    exportsField.forEach(item => collectExportCandidates(item, candidates));
    return;
  }

  if (typeof exportsField !== 'object') return;

  const priorityKeys = ['browser', 'import', 'module', 'default', 'require'];
  priorityKeys.forEach(key => {
    if (key in exportsField) collectExportCandidates(exportsField[key], candidates);
  });

  if ('.' in exportsField) {
    collectExportCandidates(exportsField['.'], candidates);
  }
}

function escapePath(candidate) {
  return candidate.replace(/\\/g, '/');
}

function resolveCandidate(packageName, packageDir, candidate, require) {
  const normalized = escapePath(candidate);

  if (normalized.startsWith('./') || normalized.startsWith('../')) {
    const absolutePath = path.resolve(packageDir, normalized);
    if (fs.existsSync(absolutePath)) return absolutePath;
    return null;
  }

  const absoluteInPackage = path.resolve(packageDir, normalized);
  if (fs.existsSync(absoluteInPackage)) return absoluteInPackage;

  try {
    return require.resolve(`${packageName}/${normalized}`);
  } catch {
    return null;
  }
}

function createHeuristicCandidates(packageName) {
  const packageBaseName = packageName.split('/').pop();
  return [
    `${packageBaseName}.min.js`,
    `${packageBaseName}.esm.js`,
    `${packageBaseName}.mjs`,
    `${packageBaseName}.js`,
    `dist/${packageBaseName}.min.js`,
    `dist/${packageBaseName}.esm.js`,
    `dist/${packageBaseName}.mjs`,
    `dist/${packageBaseName}.js`,
    'dist/index.mjs',
    'dist/index.js',
    'index.mjs',
    'index.js',
  ];
}

function isJavaScriptEntry(filePath) {
  return /\.(mjs|cjs|js)$/.test(filePath);
}

function sanitizePackageName(packageName) {
  return packageName.replace(/^@/, '').replace(/\//g, '-');
}

function createOutputFileName(packageName, resolvedInput) {
  const extension = path.extname(resolvedInput) || '.js';
  const baseName = path.basename(resolvedInput, extension);
  const packageBaseName = packageName.split('/').pop();
  const genericBaseNames = new Set(['index', 'main', 'module', 'browser']);
  if (genericBaseNames.has(baseName.toLowerCase())) {
    return `${sanitizePackageName(packageName)}${extension}`;
  }
  if (
    baseName === packageBaseName ||
    baseName.startsWith(`${packageBaseName}.`) ||
    baseName.startsWith(`${packageBaseName}-`) ||
    baseName.startsWith(`${packageBaseName}_`)
  ) {
    return `${baseName}${extension}`;
  }
  return `${sanitizePackageName(packageName)}-${baseName}${extension}`;
}

export function resolveVendorEntries({ packageJsonPath, vendorDir, require }) {
  const pkg = readJSON(packageJsonPath);
  const dependencies = Object.keys(pkg.dependencies || {});

  return dependencies.map(packageName => {
    const packageConfigPath = require.resolve(`${packageName}/package.json`);
    const packageDir = path.dirname(packageConfigPath);
    const dependencyPkg = readJSON(packageConfigPath);
    const candidates = [];

    collectExportCandidates(dependencyPkg.exports, candidates);
    addCandidate(candidates, dependencyPkg.browser);
    addCandidate(candidates, dependencyPkg.module);
    addCandidate(candidates, dependencyPkg['jsnext:main']);
    addCandidate(candidates, dependencyPkg.unpkg);
    addCandidate(candidates, dependencyPkg.jsdelivr);
    addCandidate(candidates, dependencyPkg.main);
    createHeuristicCandidates(packageName).forEach(candidate => addCandidate(candidates, candidate));

    const resolvedInput = candidates
      .map(candidate => resolveCandidate(packageName, packageDir, candidate, require))
      .find(candidate => candidate && isJavaScriptEntry(candidate));

    if (!resolvedInput) {
      throw new Error(`Cannot resolve vendor entry for "${packageName}" from ${packageConfigPath}`);
    }

    return {
      packageName,
      input: resolvedInput,
      outputFile: path.join(vendorDir, createOutputFileName(packageName, resolvedInput)),
    };
  });
}
