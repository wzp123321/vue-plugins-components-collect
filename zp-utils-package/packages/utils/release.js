import { execSync } from 'node:child_process';
import fs from 'fs';
import path from 'node:path';
import { getProjectRoot } from './shared.js';
import { generateH5AboutJson } from './generateAbout.js';

/**
 * 获取项目根目录下的package.json路径
 */
const getPackageJsonPath = () => {
  const projectRoot = getProjectRoot();
  return path.join(projectRoot, 'package.json');
};

/**
 * 读取项目根目录的package.json内容
 */
const readPackageJson = () => {
  const packageJsonPath = getPackageJsonPath();
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
};

/**
 * 写入项目根目录的package.json内容（保留格式化）
 */
const writePackageJson = (content) => {
  const packageJsonPath = getPackageJsonPath();
  fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2), 'utf8');
};

/**
 * 验证版本参数合法性（从数组接收版本号）
 * @param {string[]} args 命令行参数数组 [发布版本, 下一开发版本]
 */
const validateVersions = (args) => {
  const currentVersion = readPackageJson().version;
  const [releaseVersion, nextDeveloperVersion] = args;

  // 校验1：当前版本必须是SNAPSHOT
  if (!(currentVersion && currentVersion.endsWith('-SNAPSHOT'))) {
    throw new Error(`当前版本${currentVersion}不是SNAPSHOT版本，不允许发布`);
  }

  // 校验2：必须提供发布版本
  if (!releaseVersion) {
    throw new Error('请指定发布版本号（第一个参数），例如：1.0.0');
  }

  // 校验3：发布版本不能是SNAPSHOT
  if (releaseVersion.toUpperCase().endsWith('-SNAPSHOT')) {
    throw new Error(`发布版本${releaseVersion}不能包含-SNAPSHOT`);
  }

  // 校验4：必须提供下一开发版本
  if (!nextDeveloperVersion) {
    throw new Error('请指定下一开发版本号（第二个参数），例如：1.1.0-SNAPSHOT');
  }

  // 校验5：下一开发版本必须是SNAPSHOT
  if (!nextDeveloperVersion.toUpperCase().endsWith('-SNAPSHOT')) {
    throw new Error(`下一开发版本${nextDeveloperVersion}必须以-SNAPSHOT结尾`);
  }

  return { releaseVersion, nextDeveloperVersion };
};

/**
 * 更新版本号并提交到Git
 * @param {string} targetVersion 目标版本号
 * @param {string} commitMsg Git提交信息
 */
const updateVersionAndCommit = (targetVersion, commitMsg) => {
  // 1. 更新package.json版本号
  const packageJson = readPackageJson();
  packageJson.version = targetVersion;
  writePackageJson(packageJson);

  // 2. 提交到Git（在项目根目录执行）
  const projectRoot = getProjectRoot();
  execSync(`git add ${getPackageJsonPath()}`, {
    stdio: 'inherit', // 输出Git命令的日志到控制台
    cwd: projectRoot
  });
  execSync(`git commit -m "${commitMsg}"`, {
    stdio: 'inherit',
    cwd: projectRoot
  });
};

/**
 * 执行发布流程（支持自定义about.json输出目录）
 * @param {Object} opts 参数对象
 * @param {string} opts.releaseVersion 发布版本号
 * @param {string} opts.nextDeveloperVersion 下一开发版本号
 * @param {string} opts.outputDir 输出目录（相对于项目根目录，默认dist）
 */
export function release({ releaseVersion, nextDeveloperVersion,outputDir}) {
  try {
    const projectRoot = getProjectRoot();
    console.log(`📌 项目根目录：${projectRoot}`);

    // 1. 验证版本参数（调整参数传递方式）
    const args = [releaseVersion, nextDeveloperVersion];
    const { releaseVersion: validatedReleaseVersion, nextDeveloperVersion: validatedNextVersion } = validateVersions(args);
    console.log(`🚀 发布流程启动：${validatedReleaseVersion} → ${validatedNextVersion}`);

    // 2. 更新为发布版本并提交（保持不变）
    updateVersionAndCommit(validatedReleaseVersion, `update: 发布版本 ${validatedReleaseVersion}`);

    // 3. 创建并推送Tag（保持不变）
    execSync(`git tag -a ${validatedReleaseVersion} -m "update: Release ${validatedReleaseVersion}"`, {
      stdio: 'inherit',
      cwd: projectRoot
    });
    execSync(`git push origin ${validatedReleaseVersion}`, {
      stdio: 'inherit',
      cwd: projectRoot
    });

     // 4. 生成about.json（使用自定义输出目录）
    if(outputDir){
      generateH5AboutJson(outputDir);
    }

    // 5. 更新为下一开发版本并推送（保持不变）
    updateVersionAndCommit(validatedNextVersion, `update: 切换到开发版本 ${validatedNextVersion}`);
    execSync('git push origin HEAD', {
      stdio: 'inherit',
      cwd: projectRoot
    });

    console.log('🎉 发布成功！');
  } catch (error) {
    console.error('❌ 发布失败：', error.message);
    process.exit(1);
  }
}