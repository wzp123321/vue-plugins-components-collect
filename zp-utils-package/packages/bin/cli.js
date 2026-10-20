#!/usr/bin/env node
import minimist from 'minimist';
import { generateH5AboutJson } from '../utils/generateAbout.js';
import { release } from '../utils/release.js';
import { generateModule } from '../utils/generate-module/index.js';
import { deleteModule } from '../utils/generate-module/delete-module.js';

// 解析所有命令行参数（支持选项参数如--output-dir和位置参数）
const args = minimist(process.argv.slice(2));
const command = args._[0]; // 提取主命令

switch (command) {
  case 'generate-about': {
    // 生成命令的参数处理（保持不变）
    const outputDir = args['output-dir'] || args.o || 'dist/build/h5';
    generateH5AboutJson(outputDir);
    break;
  }
  case 'release': {
    // 提取release命令的位置参数（发布版本、下一开发版本）
    const releaseVersion = args._[1];
    const nextDeveloperVersion = args._[2];

    // 提取输出目录参数（--output-dir 或 -o，默认dist）
    const outputDir = args['output-dir'] || args.o ;

    // 传递参数给release函数
    release({
      releaseVersion,
      nextDeveloperVersion,
      outputDir
    });
    break;
  }
  case 'generate-module': {
    // 生成业务模块
    generateModule();
    break;
  }
  case 'delete-module': {
    // 删除业务模块
    deleteModule();
    break;
  }
  default:
    console.error('❌ 无效命令！可用命令：');
    console.log('  1. 生成about: ci-tools generate-about [--output-dir 目录] 或 [-o 目录]');
    console.log('  2. 版本发布: ci-tools release <发布版本> <下一开发版本> [--output-dir 目录] 或 [-o 目录]');
    console.log('  3. 生成模块: ci-tools generate-module');
    console.log('  4. 删除模块: ci-tools delete-module');
    console.log('  示例：');
    console.log('    ci-tools release 1.0.0 1.1.0-SNAPSHOT -o dist/release  # 输出到dist/release/about.json');
    process.exit(1);
}
