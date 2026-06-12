#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distBin = path.join(rootDir, 'dist', 'bin.js');
const sourceBin = path.join(rootDir, 'bin.js');

const binPath = fs.existsSync(distBin) ? distBin : sourceBin;
execSync(`node "${binPath}"`, { stdio: 'inherit' });
