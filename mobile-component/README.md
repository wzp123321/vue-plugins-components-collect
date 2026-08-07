# ts-mobile-ui

轻量级、高性能的 UniApp / UniApp-X 组件库（Vue 3），全面兼容 uni-app、uni-app-x、鸿蒙。

## 项目结构

```
ts-mobile-ui/
├── apps/
│   ├── docs/                    # VitePress 组件文档
│   └── playground/
│       ├── uniapp-project/      # uni-app 调试沙盒
│       └── uniapp-x-project/    # uni-app-x 调试沙盒
├── packages/
│   ├── components/
│   │   ├── ui/                  # 基础组件库 @tiansu/ts-mobile-ui
│   │   └── biz-ui/              # 业务组件库 @tiansu/ts-mobile-biz-ui
│   ├── core/
│   │   └── token/               # 主题系统 @tiansu/ts-mobile-token
│   └── installer/               # 安装器 @tiansu/ts-mobile-installer
└── scripts/                     # 工具脚本
```

## 前置条件

- Node.js ≥ 20
- pnpm ≥ 8（项目使用 pnpm workspace 管理 monorepo）

## 快速开始

```bash
git clone http://192.168.20.76:8000/mobile/ts-mobile-ui.git
cd ts-mobile-ui
pnpm i
```

## 开发模式

组件库支持三种开发模式，通过根目录脚本切换：

### 1. 源码模式（推荐日常开发）

源码直接 symlink 到 playground，修改源码立即生效，无需构建：

```bash
pnpm playground:use-source-components
```

### 2. 构建模式（测试构建产物）

构建 dist 后复制到 playground，模拟用户实际使用场景：

```bash
pnpm playground:use-dist-components
```

### 3. 远程模式（测试发布包）

从 npm registry 下载已发布的包，模拟用户安装流程：

```bash
pnpm playground:use-remote-components
```

三种模式的实现统一在 `scripts/link-playground-components.cjs`，通过参数区分：

| 参数        | 模式   | 行为                                                |
| ----------- | ------ | --------------------------------------------------- |
| 默认        | source | `build:token` → symlink → `npx @tiansu/ts-icon`     |
| `--restore` | dist   | `build:all` → copy dist → `npx @tiansu/ts-icon`     |
| `--remote`  | remote | unlink → `pnpm rebuild @tiansu/ts-mobile-installer` |

## 启动沙盒

```bash
# uni-app (H5)
cd apps/playground/uniapp-project
pnpm dev:h5

# uni-app-x (H5)
cd apps/playground/uniapp-x-project
pnpm dev:h5
```

> **注意**：沙盒项目在 pnpm workspace 内，**不要**在 playground 目录内执行 `npm i`。统一在根目录用 `pnpm i` 管理依赖。

## 构建

```bash
pnpm build:token        # 构建主题包
pnpm build:ui           # 构建基础组件库
pnpm build:biz-ui       # 构建业务组件库
pnpm build:installer    # 构建安装器
```

## 组件文档

```bash
pnpm docs:generate tsm-button   # 生成指定组件文档
pnpm docs:dev                   # 启动文档开发服务器
```

## 技术栈

| 类别     | 技术                      |
| -------- | ------------------------- |
| 框架     | Vue 3 + TypeScript        |
| 包管理   | pnpm workspace            |
| 构建     | 自定义 Node 脚本          |
| 文档     | VitePress                 |
| 代码规范 | ESLint + Prettier + Husky |

## 常见问题

**Q: `pnpm i` 很慢？**

项目使用私有 registry `192.168.20.200:7049`，速度取决于内网带宽。根目录 `.npmrc` 已配置 `network-concurrency=16` 和 `prefer-offline=true` 优化。

**Q: playground 中组件没有类型提示？**

确认 `tsconfig.json` 中 `moduleResolution` 为 `"bundler"`，`vue-tsc` 为 `^2.1.0`，且 `uni_modules` 中的 `.d.ts` 声明文件未被 exclude。

**Q: 修改源码后 playground 没变化？**

源码模式下，symlink 指向源码目录，修改后 HMR 自动生效。如果不行，检查是否误用了 dist 模式，重新运行 `pnpm playground:use-source-components`。
