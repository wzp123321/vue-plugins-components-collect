import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchWhitelist } from "./fetch-whitelist.js";

// 白名单文件路径
// - 从服务器获取 whitelist.json
const WHITE_LIST_PATH = "http://192.168.40.111/whitelist.json";

/**
 * 核心函数：获取项目根目录（从当前命令执行目录向上查找package.json）
 * 无论工具包安装在node_modules的哪个层级，都能定位到项目根目录
 */
export function getProjectRoot() {
  let currentDir = process.cwd(); // 从用户执行命令的目录开始查找
  const systemRoot = path.parse(currentDir).root; // 系统根目录（如C:\或/）

  // 向上遍历目录，直到找到package.json或到达系统根目录
  while (currentDir !== systemRoot) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      return currentDir; // 找到项目根目录（包含package.json的目录）
    }
    currentDir = path.dirname(currentDir); // 向上一层目录
  }

  throw new Error(
    "无法找到项目根目录，请确保在项目目录下执行命令（需存在package.json）",
  );
}

// 读取并解析 JSON 文件：
// - 文件不存在、权限异常、JSON 非法都视为硬失败
// - 失败时直接退出，避免 npm 继续执行安装流程
function readJson(filePath) {
  try {
    // 同步读取，保证钩子脚本在校验完成前不会继续后续流程
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    // 任何读取/解析失败都应阻断安装，避免绕过校验
    console.error(`读取或解析失败: ${filePath}`);
    console.error(error.message || error);
    process.exit(1);
  }
}

// 加载白名单配置：
// - 从服务器获取 whitelist.json
// - 失败时直接退出，避免 npm 继续执行安装流程
// - 严格要求 dependencies 为非空字符串数组
async function loadWhitelist() {
  try {
    const whitelist = await fetchWhitelist(WHITE_LIST_PATH);
    // 验证 dependencies 字段格式
    if (!Array.isArray(whitelist.list)) {
      console.error("whitelist.json 格式错误，dependencies 必须是字符串数组");
      process.exit(1);
    }
    // 仅允许字符串项，避免对象配置导致规则理解不一致
    const invalid = Array.from(whitelist.list).filter(
      (item) => typeof item !== "string" || item.trim() === "",
    );
    if (invalid.length > 0) {
      console.error("whitelist.json 格式错误，dependencies 只能包含非空字符串");
      process.exit(1);
    }
    return whitelist;
  } catch (error) {
    console.error("加载白名单失败");
    console.error(error.message || error);
    process.exit(1);
  }
}

// 解析 npm 注入的原始命令行参数：
// - npm_config_argv 在不同 npm 版本中可能不存在
// - 优先 original，其次 cooked，缺失时返回空数组并走环境变量兜底
function parseOriginalArgs() {
  const raw = process.env.npm_config_argv;
  // 某些 npm 版本/场景不会注入该变量，返回空数组给后续兜底逻辑处理
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // original 更接近用户输入，优先用于提取安装包参数
    if (Array.isArray(parsed.original))
      return parsed.original.map((item) => String(item));
    if (Array.isArray(parsed.cooked))
      return parsed.cooked.map((item) => String(item));
    return [];
  } catch {
    // 环境变量格式异常时不抛错，交由生命周期与命令兜底识别
    return [];
  }
}

// 读取 npm_config_xxx 这类布尔环境变量
function envFlag(name) {
  // npm 会以字符串形式传递布尔值，这里统一归一化判断
  return String(process.env[name] || "").toLowerCase() === "true";
}

// 识别当前是否属于需要校验的安装流程，并提取 install 的包参数：
// - 兼容 npm install / npm i
// - 兼容仅有生命周期信息、但缺失 npm_config_argv 的场景
// - --save-dev / --no-save / --global / --save-optional 均跳过
function parseInstallContext(originalArgs) {
  // 参数统一小写，便于做无大小写差异的选项匹配
  const lowerArgs = originalArgs.map((arg) => arg.toLowerCase());
  const installIndex = lowerArgs.findIndex(
    (arg) => arg === "install" || arg === "i",
  );
  const lifecycleEvent = String(
    process.env.npm_lifecycle_event || "",
  ).toLowerCase();
  const npmCommand = String(process.env.npm_command || "").toLowerCase();
  // 兼容 preinstall 与 dependencies 两个生命周期入口
  const fromLifecycle =
    lifecycleEvent === "preinstall" || lifecycleEvent === "dependencies";
  const fromCommand = npmCommand === "install" || npmCommand === "i";
  const isInstall = installIndex !== -1 || fromLifecycle || fromCommand;
  const isNoSave =
    lowerArgs.includes("--no-save") || envFlag("npm_config_no_save");
  const isSaveDev =
    lowerArgs.includes("--save-dev") ||
    lowerArgs.includes("-d") ||
    envFlag("npm_config_save_dev");
  const isGlobal =
    lowerArgs.includes("--global") ||
    lowerArgs.includes("-g") ||
    envFlag("npm_config_global");
  const isSaveOptional =
    lowerArgs.includes("--save-optional") ||
    lowerArgs.includes("-o") ||
    envFlag("npm_config_save_optional");
  const shouldSkip =
    !isInstall || isNoSave || isSaveDev || isGlobal || isSaveOptional;
  const specs = [];
  if (installIndex !== -1) {
    // 只采集 install 后面的包规格，忽略参数项
    for (let i = installIndex + 1; i < originalArgs.length; i += 1) {
      const current = originalArgs[i];
      if (current === "--") break;
      if (current.startsWith("-")) continue;
      specs.push(current);
    }
  }
  return {
    lifecycleEvent,
    shouldSkip,
    hasTargetPackages: specs.length > 0,
    specs,
  };
}

// 将 npm 安装规格解析为包名：
// - lodash@4.17.21 => lodash
// - @scope/pkg@1.0.0 => @scope/pkg
function extractPackageName(spec) {
  const value = String(spec || "").trim();
  if (!value) return null;
  if (value.startsWith("@")) {
    // scoped 包形如 @scope/name@1.0.0，取第二个 @ 之前为包名
    const secondAt = value.indexOf("@", 1);
    if (secondAt === -1) return value;
    return value.slice(0, secondAt);
  }
  // 普通包形如 lodash@4.17.21，取第一个 @ 之前为包名
  const at = value.indexOf("@");
  if (at === -1) return value;
  return value.slice(0, at);
}

// 自动清理非法 dependencies：
// - 仅删除 package.json 的 dependencies 直接项
// - 有变更时才写回文件，减少无意义 I/O
function removeFromDependencies(packageJsonPath, pkgJson, packageNames) {
  if (!pkgJson.dependencies || typeof pkgJson.dependencies !== "object")
    return [];
  const removed = [];
  packageNames.forEach((name) => {
    // 只删除明确存在于 dependencies 的键，避免误删其他字段
    if (Object.prototype.hasOwnProperty.call(pkgJson.dependencies, name)) {
      delete pkgJson.dependencies[name];
      removed.push(name);
    }
  });
  if (removed.length > 0) {
    // 保持 2 空格缩进与换行，避免 package.json 样式抖动
    fs.writeFileSync(
      packageJsonPath,
      `${JSON.stringify(pkgJson, null, 2)}\n`,
      "utf8",
    );
  }
  return removed;
}

// 主流程：
// 1) 读取 package.json 与 whitelist
// 2) 判断是否跳过（如 --save-dev）
// 3) 校验现有 dependencies 与本次 install 目标
// 4) 命中非法依赖则尝试清理并阻断安装
async function dependenciesGuard() {
  const projectRoot = getProjectRoot(); // 获取项目根目录
  const packageJsonPath = path.resolve(projectRoot, "package.json");
  const pkgJson = readJson(packageJsonPath);
  const whitelist = await loadWhitelist();
  // installContext 会综合 argv 与环境变量判断当前安装语义
  const installContext = parseInstallContext(parseOriginalArgs());
  if (installContext.shouldSkip) {
    // devDependencies / global / no-save 场景按需求直接放行
    process.exit(0);
  }

  // 无参数 npm install 时，直接校验 package.json 现有 dependencies
  const currentDeps = Object.keys(pkgJson.dependencies || {});
  const illegalExisting = currentDeps.filter(
    (name) => !whitelist.list.includes(name),
  );
  // 有参数 npm install <pkg> 时，同时校验本次新增目标包
  const installPackageNames = Array.from(
    new Set(installContext.specs.map(extractPackageName).filter(Boolean)),
  );
  const illegalInstall = installContext.hasTargetPackages
    ? installPackageNames.filter((name) => !whitelist.list.includes(name))
    : [];

  if (illegalExisting.length === 0 && illegalInstall.length === 0) {
    console.log("依赖白名单校验通过");
    process.exit(0);
  }

  // 本次 install 直接指定了非法包：
  // - 若 npm 已先改写 package.json，这里执行回滚删除
  if (illegalInstall.length > 0) {
    const removed = removeFromDependencies(
      packageJsonPath,
      pkgJson,
      illegalInstall,
    );
    if (removed.length > 0) {
      console.error("已从 package.json 的 dependencies 移除非法依赖:");
      removed.forEach((name) => console.error(`  - ${name}`));
    }
    // dependencies 生命周期执行时，npm 可能先把依赖写入 package.json，
    // 此时 specs 可能为空，改为基于非法现存依赖进行兜底清理
  } else if (
    installContext.lifecycleEvent === "dependencies" &&
    illegalExisting.length > 0
  ) {
    // dependencies 生命周期下兜底清理现存非法项，保证回滚结果一致
    const removed = removeFromDependencies(
      packageJsonPath,
      pkgJson,
      illegalExisting,
    );
    if (removed.length > 0) {
      console.error("已从 package.json 的 dependencies 移除非法依赖:");
      removed.forEach((name) => console.error(`  - ${name}`));
    }
  }

  console.error("依赖白名单校验失败，已阻止安装");
  if (illegalExisting.length > 0) {
    console.error("package.json 中存在非白名单依赖:");
    illegalExisting.forEach((name) => console.error(`  - ${name}`));
  }
  if (illegalInstall.length > 0) {
    console.error("本次安装请求存在非白名单依赖:");
    illegalInstall.forEach((name) => console.error(`  - ${name}`));
  }
  console.error(`白名单文件: ${whitelist.url}`);
  process.exit(1);
}

// 入口：作为 npm lifecycle 脚本执行
dependenciesGuard();
