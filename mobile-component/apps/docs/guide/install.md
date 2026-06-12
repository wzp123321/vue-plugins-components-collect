# 安装

`ts-mobile-ui` 支持 **uni-app** 和 **uni-app-x** 双端，通过 `@tiansu/ts-mobile-installer` 自动安装组件到 `uni_modules`。

## 前提

项目需要安装 `@tiansu/ts-mobile-installer` 作为依赖：

```bash
npm install @tiansu/ts-mobile-installer --foreground-scripts
```

安装时，`postinstall` 会自动触发组件安装流程。建议添加 `--foreground-scripts` 参数以查看安装日志（npm 10.x 默认隐藏生命周期脚本输出）。

安装器会将组件下载到 `src/uni_modules/`（或 `uni_modules/`）目录，这些文件通过 `npx` 拉取，无需提交到版本控制。建议在 `.gitignore` 中添加：

```
uni_modules
src/uni_modules
```

> **注意**：`postinstall` 仅在包**首次安装或版本变更**时执行。已安装相同版本的情况下再次执行 `npm i` 不会重新触发。如需重新运行安装器，参考[升级指南](#升级指南)。

## 1. 配置 uni.dependencies.json

在项目根目录创建 `uni.dependencies.json`，声明需要安装的包及版本：

```json
{
  "@tiansu/ts-mobile-token": "^0.0.20",
  "@tiansu/ts-mobile-ui": "^0.0.26",
  "@tiansu/ts-icon": "^0.0.55"
}
```

> 如果不存在此文件，安装器会自动创建默认版本配置（含 `@tiansu/ts-mobile-token`、`@tiansu/ts-mobile-ui`、`@tiansu/ts-icon`）。若有业务组件需求，如 `@tiansu/ts-mobile-biz-ui`，需自行添加到此文件中。

## 2. 配置 easycom

根据你的项目类型，在 `pages.json` 中配置 easycom 规则。

### uni-app 项目

`pages.json` 中配置：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^tsm-theme-provider$": "@/uni_modules/@tiansu/ts-mobile-token/theme-provider/uniapp/tsm-theme-provider.vue",
      "^tsm-(.*)": "@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-$1/uniapp/tsm-$1.vue",
      "^tsmbiz-(.*)": "@/uni_modules/@tiansu/ts-mobile-biz-ui/components/tsmbiz-$1/uniapp/tsmbiz-$1.vue",
      "^icon-(.*)$": "@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-$1.vue"
    }
  }
}
```

### uni-app-x 项目

`pages.json` 中配置：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^tsm-theme-provider$": "@/uni_modules/@tiansu/ts-mobile-token/theme-provider/uniapp-x/tsm-theme-provider.uvue",
      "^tsm-(.*)": "@/uni_modules/@tiansu/ts-mobile-ui/components/tsm-$1/uniapp-x/tsm-$1.uvue",
      "^tsmbiz-(.*)": "@/uni_modules/@tiansu/ts-mobile-biz-ui/components/tsmbiz-$1/uniapp-x/tsmbiz-$1.uvue",
      "^icon-(.*)$": "@/uni_modules/@tiansu/ts-icon/mobile/uvue/icon-$1/icon-$1.uvue"
    }
  }
}
```

> `tsm-theme-provider` 来自 `@tiansu/ts-mobile-token` 包，需要单独配置精确匹配规则，放在通配规则之前优先匹配。

## 3. 引入全局样式

在 `App.vue`（或 `App.uvue`）中引入 token 全局 SCSS 变量，这样所有页面和组件都能使用主题相关的 CSS 变量。

### uni-app 项目

`src/App.vue`：

```html
<style lang="scss">
  @import './uni_modules/@tiansu/ts-mobile-token/tokens.scss';
</style>
```

### uni-app-x 项目

`App.uvue`：

```html
<style lang="scss">
  @import './uni_modules/@tiansu/ts-mobile-token/tokens.scss';
</style>
```

## 4. 初始化

配置完成后，执行：

```bash
npm install --foreground-scripts
```

`postinstall` 会自动执行安装器，将包安装到 `uni_modules` 目录。

> **提示**：建议始终添加 `--foreground-scripts`，以便查看安装器的执行日志。若省略此参数，npm 10.x 会隐藏生命周期脚本的输出，可能误以为安装未执行。

然后在项目入口文件中注册插件并初始化主题模式。

### uni-app 项目

`src/main.ts`：

```ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import UI from '@/uni_modules/@tiansu/ts-mobile-ui/components/index';
import BizUI from '@/uni_modules/@tiansu/ts-mobile-biz-ui/components/index';
import { initThemeMode } from '@/uni_modules/@tiansu/ts-mobile-token/index';

export function createApp() {
  const app = createSSRApp(App);
  app.use(UI);
  app.use(BizUI);
  initThemeMode();
  return { app };
}
```

> 如果未使用 `@tiansu/ts-mobile-biz-ui`，可省略 `import BizUI` 和 `app.use(BizUI)`。

### uni-app-x 项目

`main.uts`：

```uts
import App from './App.uvue';
import { createSSRApp } from 'vue';
import UI from '@/uni_modules/@tiansu/ts-mobile-ui/components/index.uts';
import { initThemeMode } from '@/uni_modules/@tiansu/ts-mobile-token/index.uts';

export function createApp() {
  const app = createSSRApp(App);
  app.use(UI);
  initThemeMode();
  return { app };
}
```

> **注意**：uni-app-x 中 token 和 UI 包均使用 `.uts` 扩展名导入。

## 5. 使用组件

easycom 配置完成后，组件可直接在模板中使用，无需手动 import：

```vue
<template>
  <view>
    <tsm-button type="primary">主要按钮</tsm-button>
    <tsm-tag type="success" text="成功标签" />
  </view>
</template>
```

## 6. 主题

### 主题根容器（推荐）

使用 `tsm-theme-provider` 作为页面根容器，子组件自动继承主题：

```vue
<template>
  <tsm-theme-provider>
    <view class="page">
      <tsm-button type="primary">主要按钮</tsm-button>
    </view>
  </tsm-theme-provider>
</template>
```

固定某个页面主题，可直接传 `mode`：

```vue
<tsm-theme-provider mode="dark">
  <view class="page">...</view>
</tsm-theme-provider>
```

### 运行时主题 API

从 `@tiansu/ts-mobile-token` 包中引入以下 API：

```ts
// uni-app 项目
import {
  initThemeMode,
  getThemeMode,
  getThemeClass,
  setThemeMode,
  toggleThemeMode,
  useThemeMode,
  useThemeClass,
} from '@/uni_modules/@tiansu/ts-mobile-token/index';

// uni-app-x 项目（使用 .uts 扩展名）
import {
  initThemeMode,
  getThemeMode,
  getThemeClass,
  setThemeMode,
} from '@/uni_modules/@tiansu/ts-mobile-token/index.uts';
```

| API                  | 说明                                                      |
| -------------------- | --------------------------------------------------------- |
| `initThemeMode()`    | 初始化主题模式（从本地存储读取，需在 `createApp` 中调用） |
| `getThemeMode()`     | 获取当前主题模式，返回 `'light'` 或 `'dark'`              |
| `getThemeClass()`    | 获取当前主题对应的 CSS class 名                           |
| `setThemeMode(mode)` | 设置主题模式，`mode` 为 `'light'` 或 `'dark'`             |
| `toggleThemeMode()`  | 切换主题模式（light ↔ dark）                              |
| `useThemeMode()`     | 响应式主题模式（Vue computed）                            |
| `useThemeClass()`    | 响应式主题 CSS class（Vue computed）                      |

## 升级指南

### 更新组件版本

修改项目根目录的 `uni.dependencies.json`，更新目标版本号：

```json
{
  "@tiansu/ts-mobile-token": "^0.0.22",
  "@tiansu/ts-mobile-ui": "^0.1.0",
  "@tiansu/ts-icon": "^0.1.0"
}
```

**本地开发环境**，由于 `node_modules` 已存在且 installer 版本未变，直接执行 `npm i` 不会触发 `postinstall`。需要手动 rebuild：

```bash
npm rebuild @tiansu/ts-mobile-installer --foreground-scripts
```

**CI 环境**（如 Jenkins），每次构建通常从零开始（无 `node_modules`），`npm i` 会完整安装所有依赖，installer 的 `postinstall` 自动触发并读取最新的 `uni.dependencies.json`，无需额外操作。

> **为什么本地需要 `npm rebuild`？** `npm i` 仅在包**首次安装或版本变更**时触发 `postinstall`。本地已有 `node_modules` 缓存，installer 本身版本未变，`npm i` 判定无事可做直接跳过。`npm rebuild` 无视缓存状态，强制重新执行生命周期脚本。

### 重新生成 uni_modules

如果 `uni_modules` 目录被误删或需要完全重新安装：

```bash
npm rebuild @tiansu/ts-mobile-installer --foreground-scripts
```

安装器会重新通过 `npx` 拉取各组件包到 `uni_modules`。

### 升级 @tiansu/ts-mobile-installer 自身

```bash
npm install @tiansu/ts-mobile-installer@latest --foreground-scripts
```

installer 版本变更时 `postinstall` 会自动执行，无需额外操作。

### 常见问题

**Q: 执行 `npm i` 后没有看到安装日志？**

npm 10.x 默认隐藏生命周期脚本的输出。添加 `--foreground-scripts` 参数即可看到完整日志。也可以在 `.npmrc` 中设置 `foreground-scripts=true` 将其设为默认行为。

**Q: `npm rebuild` 报错或未生效？**

确保当前目录是 uni-app 项目根目录（存在 `pages.json` 或 `src/pages.json`），否则安装器会跳过执行。

**Q: 组件版本没有更新？**

检查 `uni.dependencies.json` 中的版本号是否正确，然后确认 `npm rebuild` 的输出日志中对应包的状态是"重新安装"而非"已安装，跳过"。

**Q: 启动后报错 `Preprocessor dependency "sass" not found`？**

组件库的 SCSS 样式依赖 `sass` 预处理器。在项目中安装即可：

```bash
npm install -D sass
```
