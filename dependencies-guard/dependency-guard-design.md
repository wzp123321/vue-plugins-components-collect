# 依赖拦截（Dependency Guard）设计文档（npm 依赖白名单）

## 1. 背景

在多人协作与 CI 场景下，依赖引入往往是供应链风险与可维护性风险的主要来源之一（例如：随意引入大依赖、引入存在漏洞的包、引入不兼容的包）。本方案通过“依赖白名单”机制，在依赖安装阶段对依赖变更进行拦截与纠偏，确保项目只安装被允许的依赖。

技术实现参考现有脚本：

- 依赖拦截脚本：`scripts/enforce-dependency-whitelist.js`
- 白名单同步脚本（可选）：`scripts/sync-dependency-whitelist-from-gitlab.js`
- 接入入口：`package.json#scripts.preinstall`

## 2. 目标与非目标

### 2.1 目标

- 以项目级白名单约束依赖引入：白名单维护在 `package.json#dependencyWhitelist`
- 在 `npm install / npm ci` 等安装链路中强制校验，发现非法依赖立即阻断
- 尽可能在“命令行直接安装某个包”时提前阻断（例如 `npm i lodash`），并在失败时自动清理污染
- 输出稳定、可读的错误信息，便于本地排查与 CI 阅读

### 2.2 非目标（当前版本不做）

- 不解析并放行 `git/url/file/workspace` 等复杂依赖 spec（策略上倾向“只允许 registry 包名”）
- 不做漏洞扫描、license 扫描等（属于更上层的依赖治理）
- 不保证 100% 覆盖所有 npm 版本/所有命令形态（受 npm lifecycle 触发行为影响）

## 3. 总体方案

### 3.1 核心思想

- 白名单是唯一“允许安装”的依据：未配置白名单直接失败，避免“空白名单=全放行”的隐患
- 拦截点选在 npm lifecycle（`preinstall` + `dependencies` 兜底），在依赖真正落地前/变更后做校验
- 一旦发现违规：
  1. 先清晰输出违规清单
  2. 再执行 `npm uninstall` + `npm prune` 做自动回滚
  3. 最终以非 0 退出码强制失败，阻断本次安装

### 3.2 接入方式（当前仓库示例）

在项目 `package.json` 中配置：

- `scripts.preinstall`: `node ./scripts/enforce-dependency-whitelist.js`
- `dependencyWhitelist`: 白名单数组

示例：

```json
{
  "scripts": {
    "preinstall": "node ./scripts/enforce-dependency-whitelist.js"
  },
  "dependencyWhitelist": ["typescript", "vite", "vue"]
}
```

## 4. 白名单数据模型与规则

### 4.1 数据模型

- 位置：`package.json#dependencyWhitelist`
- 类型：字符串数组
- 语义：允许出现的依赖“包名”规则列表

### 4.2 匹配规则（当前实现）

- 精确匹配：`"vue"` 仅匹配 `vue`
- scope 前缀匹配：以 `/*` 结尾视为前缀规则，例如 `"@types/*"` 匹配 `@types/node`、`@types/react`

## 5. 拦截点与触发条件

### 5.1 触发来源

依赖拦截由 npm lifecycle 触发：

- `preinstall`：通常在 `npm install / npm ci` 时触发
- `dependencies`：当 `node_modules` 发生变更后触发，用于兜底

### 5.2 触发判定（当前实现）

- 若不是安装生命周期、且没有解析到命令行安装目标，则跳过校验以避免误伤

### 5.3 命令行安装目标解析（当前实现）

- 从 `npm_config_argv` 解析用户输入的原始参数，提取 `install/i/add/ci` 的包规格（过滤掉 `-` 开头的 flag）
- 将规格转换为包名（忽略版本/tag，支持 scope 包与 `npm:` alias）

## 6. 校验策略

### 6.1 校验对象（当前实现）

1. `package.json#dependencies` 中的依赖是否都在白名单内（不校验 `devDependencies`）
2. 本次命令行指定要安装的包名是否都在白名单内

### 6.2 同时做两类校验的原因

- `dependencies` 校验是“最终落地态”校验：只要非法包被写进 `dependencies`，无论怎么写入，最终都能被拦住
- “命令行目标”校验是“提前失败”体验优化：尽量在安装过程中尽早提示，减少安装耗时与污染范围

## 7. 违规处理与自动修复

### 7.1 错误输出

- 违规项会去重、排序，保证输出稳定
- 输出为单行 `- item` 的形式，便于复制与 CI 阅读

### 7.2 自动清理策略（当前实现）

- 对已写入 `dependencies` 的非法依赖：执行 `npm uninstall <name>`（会同步更新 `package.json/lockfile`）
- 对本次命令指定但不允许的依赖：执行 `npm uninstall <name> --no-save`，尽量清理 `node_modules` 侧影响
- 最后执行 `npm prune` 清理残留

### 7.3 防递归与副作用控制（当前实现）

- 防重入：通过环境变量 `DEPENDENCY_WHITELIST_INTERNAL` 标记脚本自触发的 npm 子命令，避免死循环
- 降低副作用：脚本内部执行 `uninstall/prune` 时强制 `ignore-scripts`，避免执行依赖包的 `postinstall` 等脚本

## 8. 白名单的集中治理（可选：GitLab 同步）

为避免各仓库手工维护白名单不一致，可在 CI 或本地通过脚本从 GitLab 拉取统一白名单并写回 `package.json#dependencyWhitelist`：

- 脚本：`scripts/sync-dependency-whitelist-from-gitlab.js`

### 8.1 支持的白名单文件格式（当前实现）

- JSON 数组：`["vue","vite"]`
- JSON 对象：`{"dependencyWhitelist":["vue","vite"]}`
- 文本：每行一个包名，支持 `#` 注释行

## 9. 已知边界与风险

- npm v7+：`npm install <pkg>` 不一定触发项目根 `preinstall`，导致“命令行目标”校验不一定生效；但只要最终写入了 `dependencies`，仍会被“落地态校验”拦住
- 当前仅校验 `dependencies`：不限制 `devDependencies`
- 不解析复杂 spec：URL/git/file/workspace 这类 spec 不做“命令行提前校验”，但如果它们最终写进 `dependencies`，仍会在落地态校验时被拦截
- 若在 CI 使用 `npm ci --ignore-scripts`：会绕过 lifecycle，从而绕过拦截；此属于流程配置风险

## 10. 演进方向（建议项）

- 扩展校验范围：增加对 `devDependencies`（或可配置开关）的校验
- 更强的“落地态”校验：结合 lockfile（如 `package-lock.json`）或 `npm ls --json` 做依赖树级别审计（不仅是顶层 dependencies）
- 多包管理器支持：提供 pnpm/yarn 的对等拦截点与参数解析策略
- 白名单规则增强：支持更丰富的 pattern 与“例外列表”（按目录/包隔离策略等）
