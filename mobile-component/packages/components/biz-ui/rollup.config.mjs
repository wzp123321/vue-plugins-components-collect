import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { createVendorImportRewritePlugin } from './scripts/rollup/vendor-plugin.mjs';
import { resolveVendorEntries } from './scripts/rollup/vendor-resolver.mjs';

const require = createRequire(import.meta.url);
const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(packageRoot, 'dist');
const packageJsonPath = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const distUIModuleRoot = path.join(distRoot, packageJson.name);
const vendorPath = path.join(distUIModuleRoot, 'vendor');

const vendorEntries = resolveVendorEntries({
  packageJsonPath,
  vendorDir: vendorPath,
  require,
});

export default vendorEntries.map((entry, index) => ({
  input: entry.input,
  output: {
    file: entry.outputFile,
    format: 'esm',
    sourcemap: false,
  },
  plugins: [
    resolve(),
    commonjs(),
    terser(),
    index === vendorEntries.length - 1
      ? createVendorImportRewritePlugin({
          distModuleRoot: distUIModuleRoot,
          mappings: vendorEntries,
        })
      : null,
  ].filter(Boolean),
}));
