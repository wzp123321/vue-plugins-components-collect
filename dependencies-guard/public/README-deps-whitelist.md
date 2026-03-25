# 依赖白名单校验方案说明

## 目标

- 使用 `whitelist.json` 维护项目允许的直接依赖白名单（仅针对 `dependencies`）。
- 在执行 `npm install` 时自动触发校验，阻止不在白名单内的新依赖写入 `dependencies`。
- 对已有依赖做一次整体校验，保证 `package.json.dependencies` 中没有“脏数据”。

## 目录结构

项目根目录相关文件：

- `package.json`：项目依赖定义与 npm 脚本。
- `whitelist.json`：依赖白名单配置文件。
- `src/check-deps-whitelist.js`：依赖白名单校验脚本。

## whitelist.json 说明

示例：

```json
{
  "dependencies": [
    "@angular/animations",
    "@angular/common",
    "@angular/compiler",
    "@angular/core",
    "@angular/forms",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/router",
    "@tiansu/tools",
    "asmcrypto.js",
    "crypto-js",
    "echarts",
    "lodash",
    "moment",
    "ng-zorro-antd",
    "ngx-echarts",
    "rxjs",
    "tslib",
    "zone.js"
  ]
}
```

- 仅维护一个字段：`dependencies`。
- `dependencies` 为字符串数组，每个元素是一个“允许出现在 `package.json.dependencies` 中的包名”。
- 不关心版本号，也不关心 `devDependencies` / `peerDependencies` 等其它字段。

如需新增白名单依赖，只需在数组中追加包名，例如：

```json
{
  "dependencies": [
    "...",
    "lodash-es"
  ]
}
```

## 脚本执行时机

在 `package.json` 中配置了以下 npm 脚本：

```json
{
  "scripts": {
    "check:deps": "node ./src/check-deps-whitelist.js",
    "preinstall": "npm run check:deps"
  }
}
```

- `npm run check:deps`：手动执行依赖白名单校验。
- `preinstall`：在任何 `npm install` / `npm ci` 正式开始前自动执行 `check:deps`。

因此，以下命令都会触发校验脚本：

- `npm install`
- `npm i`
- `npm install 包名`
- `npm install 包名@版本`
- `npm ci`

## 校验规则

脚本分两部分逻辑：

1. **校验已有 dependencies**
   - 读取项目根目录的 `package.json`。
   - 提取 `dependencies` 中所有包名。
   - 与 `whitelist.json.dependencies` 做对比。
   - 如果发现某个依赖不在白名单内，则报错并终止本次安装或脚本执行。

2. **拦截本次 install 试图新增到 dependencies 的依赖**
   - 通过 `process.env.npm_config_argv` 解析原始命令行参数。
   - 识别命令是否为：
     - `npm install` / `npm i`
     - 是否带 `--save-dev` / `-D` / `--save-optional` / `--no-save` / `-g` 等参数。
   - 仅在本次命令会向 `dependencies` 写入新依赖时拦截（即默认的 `npm install xxx` 场景）。
   - 支持的形式包括：
     - `npm install lodash`
     - `npm install lodash@4`
     - `npm install @scope/pkg@1.0.0`
   - 对每个将要写入 `dependencies` 的新包名，检查其是否存在于 `whitelist.json.dependencies` 中：
     - 在白名单中：允许执行。
     - 不在白名单中：报错并终止安装。

## 不处理的场景

- 不校验 `devDependencies`、`peerDependencies`、`optionalDependencies` 等字段。
- 不校验间接依赖（依赖的依赖），只关注直接声明在 `package.json.dependencies` 中的依赖。
- 对以下命令不会做新增依赖拦截（因为不会写入 `dependencies`）：
  - `npm install 包名 --save-dev` / `npm install 包名 -D`
  - `npm install 包名 --save-optional` / `npm install 包名 -O`
  - `npm install 包名 --no-save`
  - `npm install 包名 -g`

> 如果需要放宽或收紧策略，可以直接修改 `src/check-deps-whitelist.js` 中关于参数解析和过滤的逻辑。

## 常见使用方式

1. **首次接入**
   - 根据现有 `package.json.dependencies` 生成一份 `whitelist.json`（当前项目已根据现有依赖生成）。
   - 执行 `npm install`，确认脚本可以正常通过。

2. **新增依赖**
   - 先在 `whitelist.json.dependencies` 中加入新的包名。
   - 然后执行：
     - `npm install 新包名`
   - 若忘记维护白名单，`npm install` 会直接失败并提示不在白名单中。

3. **审查依赖**
   - 随时可通过 `npm run check:deps` 手动执行一次依赖白名单校验。

