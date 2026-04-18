# ts-mobile-ui

一个轻量级、高性能的 UniApp/UniApp-X 组件库（Vue 3）。

## 本地开发

### 前置条件

- Node.js (v20 或更高版本)
- pnpm

### 项目设置

1. 克隆仓库：

```bash
git clone http://192.168.20.76:8000/mobile/ts-mobile-ui.git
cd ts-mobile-ui
```

2. 安装依赖：

```bash
pnpm install
```

### 开发流程

#### UniApp/UniApp-X 沙盒项目

`apps/playground` 目录包含一个用于测试和调试组件库的沙盒项目，支持 UniApp 和 UniApp-X。

**本地开发模式：**

在本地开发时，不需要构建组件包，可以直接使用源码进行开发。在项目根目录运行：

```bash
npm run playground:use-source-components
```

这个命令会将沙盒项目中的组件包软链接到源码目录，这样你对源码的修改会立即反映到沙盒项目中，无需重新构建。

**运行沙盒项目：**

```bash
cd apps/playground/uniapp-project
npm run dev:h5
```

这将启动 uniapp-project 中的h5 版本的开发服务器。
同理也可启动 uniapp-x-project 中的 h5 版本的开发服务器。

**组件文档开发：**

开发完一个组件后，可以生成和查看组件文档：

1. 生成组件文档（例如生成 `tsm-button` 组件的文档）：

```bash
pnpm docs:generate tsm-button
```

2. 启动文档开发服务器查看在线文档：

```bash
pnpm docs:dev
```

这将启动 VitePress 文档服务器，你可以在浏览器中查看生成的组件文档。
