---
pdf_options:
  format: a4
  margin: 15mm
  printBackground: true
---

<style>
/* CSS Reset and Modern Typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --primary: #2979ff;
  --text-main: #1d1d1f;
  --text-sec: #86868b;
  --bg: #ffffff;
  --code-bg: #f5f5f7;
  --border: #d2d2d7;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-main);
  line-height: 1.6;
  font-size: 11pt;
}

h1, h2, h3 {
  color: var(--text-main);
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  border-bottom: none;
}

h1 {
  font-size: 28pt;
  text-align: center;
  margin-bottom: 1em;
  background: linear-gradient(135deg, #2979ff 0%, #00d2ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: 18pt;
  border-left: 4px solid var(--primary);
  padding-left: 12px;
  background: #f0f7ff;
  border-radius: 4px;
}

h3 {
  font-size: 14pt;
  color: var(--primary);
}

code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--code-bg);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  background: var(--code-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border);
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid var(--primary);
  margin-left: 0;
  padding-left: 16px;
  color: var(--text-sec);
  font-style: italic;
  background: #f9f9fb;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Custom TOC */
#table-of-contents {
  background: #f5f5f7;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

#table-of-contents ul {
  list-style: none;
  padding-left: 0;
}

#table-of-contents li {
  margin-bottom: 8px;
}

#table-of-contents a {
  text-decoration: none;
  color: var(--primary);
  font-weight: 600;
}

.page-break {
  page-break-before: always;
}

footer {
  text-align: center;
  font-size: 9pt;
  color: var(--text-sec);
  margin-top: 50px;
}
</style>

# PhillUI 组件开发指南 (0-1)

> 欢迎加入 PhillUI 核心开发团队。本指南旨在规范组件库的开发流程，确保代码的高质量维护与跨平台兼容性。

<div id="table-of-contents">

## 文档目录

1. [前置说明](#前置说明)
2. [开发环境准备](#开发环境准备)
3. [组件统一目录结构](#组件统一目录结构)
4. [组件开发强制规范](#组件开发强制规范)
5. [从零开发一个组件的完整步骤](#从零开发一个组件的完整步骤)
6. [兼容 uni-app / uni-app x 写法](#兼容-uni-app-uni-app-x-写法)
7. [组件调试、预览与测试](#组件调试、预览与测试)
8. [代码提交规范](#代码提交规范)
9. [常见问题与模板](#常见问题与模板)

</div>

<div class="page-break"></div>

## 1. 前置说明

### 1.1 组件库定位

PhillUI 是一款面向 **UniApp** 和 **UniApp X (UTS)** 生态的「高性能、轻量级、Vue 3 原生写法」的移动端组件库。我们的目标是打造一套接近原生体验、代码逻辑极其精简且易于扩展的 UI 套件。

### 1.2 兼容要求

- **Vue 版本**: 严格基于 Vue 3 (Composition API / `<script setup>`)。
- **运行环境**: iOS, Android, H5, 各平台小程序（微信、支付宝）。
- **技术底座**: 基于 UniApp 编译器，深度集成 UTS (Uni-app TypeScript)。

---

## 2. 开发环境准备

在开始编写代码前，请确保你的本地开发环境符合以下要求：

- **Node.js**: `v20.0.0` 或更高版本。
- **包管理器**: 必须且仅使用 `pnpm` (推荐 `v8+`)。
- **开发工具**:
  - **HBuilderX**: 用于编译和测试 UniApp/UniApp X 的各项平台差异。
  - **VS Code**: 配合插件 `Volar` 进行代码编写。
- **代码克隆**:
  ```bash
  git clone https://github.com/lvli0401/phillUI.git
  cd phillUI
  pnpm install
  ```

---

## 3. 组件统一目录结构

为了实现一套逻辑多端共用，我们采用了特殊的目录分层结构：

```text
packages/components/ui/
├── uniapp/               # 基础 UniApp 组件层 (.vue + .ts)
│   └── components/
│       └── [button]/     # 单个组件目录
│           ├── button.vue # 视图与逻辑
│           └── props.ts   # 严格分离的属性定义
├── uniapp-x/             # UniApp X (UTS) 兼容层 (.uvue + .uts)
│   └── components/
│       └── [button]/
│           ├── button.uvue
│           └── props.uts
```

---

## 4. 组件开发强制规范

### 4.1 核心规范

1.  **必须使用 `<script setup>`**: 杜绝使用 Options API。
2.  **属性分离 (Props Separation)**: 所有组件的 `props` 定义必须单独放在 `props.ts` (或 `props.uts`) 中。
3.  **BEM 命名**: 使用内建的 `bem()` 工具函数配置类名。
4.  **样式隔离**: 统一使用 `scoped` SCSS，并以 `tsm-` 作为根类名前缀。
5.  **性能优先**: 复杂交互（如点击、滑动）应包裹 `throttle` (节流) 或 `debounce` (防抖)。

### 4.2 工具函数推荐

- `addStyle()`: 统一处理自定义样式的合并。
- `addUnit()`: 处理物理尺寸单位 (px/rpx)。
- `getThemeMode()`: 获取当前主题 (Dark/Light)。

---

<div class="page-break"></div>

## 5. 从零开发一个组件的完整步骤

### 第一步：创建目录

在 `packages/components/ui/uniapp/components/` 下新建 `my-component` 文件夹。

### 第二步：定义属性 (`props.ts`)

```typescript
export const myComponentProps = {
  text: { type: String, default: '' },
  color: { type: String, default: '#333' },
  customStyle: { type: [Object, String], default: () => ({}) },
};
```

### 第三步：编写逻辑 (`my-component.vue`)

```vue
<script setup>
import { computed } from 'vue';
import { addStyle, bem } from '../../libs/function/index.ts';
import { myComponentProps } from './props.ts';

const props = defineProps(myComponentProps);
const bemClass = computed(() => bem('my-component', [props.type]));
</script>

<template>
  <view class="tsm-my-component" :class="bemClass" :style="[addStyle(customStyle)]">
    {{ text }}
  </view>
</template>
```

### 第四步：注册组件

在 `packages/components/ui/uniapp/index.ts` 中引入并使用 `app.component` 注册。

---

## 6. 兼容 uni-app / uni-app x 写法

- **类型系统**: UTS 环境下要求更严格的类型声明。
- **属性声明**:
  - `uniapp`: 使用 `defineProps(xxxProps)`。
  - `uniapp-x`: 使用 `withDefaults(defineProps<Props>(), ...)`。
- **工具链自动同步**: 我们提供了自动化脚本处理转换：
  ```bash
  pnpm run auto-convert # (内部脚本)
  ```

---

## 7. 组件调试、预览与测试

我们内置了 **Playground** 应用作为调试战场：

1.  打开 `apps/playground` 项目。
2.  使用 HBuilderX 运行到模拟器或 H5 预览。
3.  在页面中直接引入你的组件进行验证。

---

## 8. 代码提交规范

- **变更记录**: 每次功能更新必须运行 `pnpm changeset` 并填写详细的变更说明。
- **提交流程**:
  ```bash
  pnpm changeset        # 选择影响的包并记录变更
  git add .
  git commit -m "feat: add sticky-header component"
  ```

---

## 9. 常见问题与模板

### 9.1 如何处理暗黑模式？

直接使用 `@tiansu/ts-mobile-token` 中的 CSS 变量，例如：
`background-color: var(--tsm-bg-1);`

### 9.2 为什么我的样式不生效？

请检查类名是否由 `bem()` 生成且前缀是否为 `tsm-`。

---

<footer>
© 2024 PhillUI Team. All Rights Reserved.
</footer>
