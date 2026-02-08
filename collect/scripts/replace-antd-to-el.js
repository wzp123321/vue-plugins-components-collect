import fs from 'fs';
import path from 'path';

const replacements = [
  { from: /a-button/g, to: 'el-button' },
  { from: /a-input/g, to: 'el-input' },
  { from: /a-checkbox/g, to: 'el-checkbox' },
  { from: /a-radio/g, to: 'el-radio' },
  { from: /a-radio-group/g, to: 'el-radio-group' },
  { from: /a-radio-button/g, to: 'el-radio-button' },
  { from: /a-tree/g, to: 'el-tree' },
  { from: /a-menu/g, to: 'el-menu' },
  { from: /a-menu-item/g, to: 'el-menu-item' },
  { from: /a-sub-menu/g, to: 'el-sub-menu' },
  { from: /a-layout/g, to: 'el-container' },
  { from: /a-layout-header/g, to: 'el-header' },
  { from: /a-layout-content/g, to: 'el-main' },
  { from: /a-layout-sider/g, to: 'el-aside' },
  { from: /a-layout-footer/g, to: 'el-footer' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const replacement of replacements) {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir, extensions = ['.vue', '.html']) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      processDirectory(fullPath, extensions);
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      processFile(fullPath);
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
console.log('Starting replacement...');
processDirectory(srcDir);
console.log('Replacement complete!');
