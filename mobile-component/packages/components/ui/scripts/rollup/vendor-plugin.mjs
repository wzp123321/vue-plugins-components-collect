import fs from 'node:fs';
import path from 'node:path';

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
      return;
    }
    callback(fullPath);
  });
}

function toImportPath(fromFile, toFile) {
  const relativePath = path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/');
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createVendorImportRewritePlugin({ distModuleRoot, mappings }) {
  return {
    name: 'rewrite-vendor-imports',
    writeBundle() {
      walk(distModuleRoot, filePath => {
        if (!/\.(js|ts|vue|uvue|uts)$/.test(filePath)) return;

        const original = fs.readFileSync(filePath, 'utf8');
        let replaced = original;

        mappings.forEach(mapping => {
          const importPattern = new RegExp(
            `import\\s+([\\w$]+)\\s+from\\s+['"]${escapeRegExp(mapping.packageName)}['"]`,
            'g'
          );
          replaced = replaced.replace(importPattern, (_, localName) => {
            return `import ${localName} from '${toImportPath(filePath, mapping.outputFile)}'`;
          });
        });

        if (replaced !== original) {
          fs.writeFileSync(filePath, replaced, 'utf8');
        }
      });
    },
  };
}
