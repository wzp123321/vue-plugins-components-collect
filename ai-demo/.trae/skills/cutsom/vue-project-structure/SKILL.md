---
name: "vue-project-structure"
description: "提供 Vue 3 + Vite + TypeScript 项目的目录结构规范和代码组织建议。在创建新页面、组件、API 模块或重构项目结构时使用此技能。"
---

# Vue 项目结构规范 (Vue Project Structure Guidelines)

本技能定义了 Vue 3 + Vite + TypeScript 项目的标准目录结构和编码规范，旨在提高代码的可维护性和一致性。

## 目录结构规范

### 1. 根目录核心文件
- **App.vue**: 根组件，负责应用的顶层布局和全局配置。
- **main.ts**: 入口文件，负责创建 Vue 应用实例、挂载 Pinia、Router、全局指令及插件。
- **vite-env.d.ts**: Vite 环境类型声明，确保 TypeScript 识别 `.vue` 文件及 Vite 特有类型。

### 2. 视图与路由 (Views & Router)
- **router/**: 路由配置中心。
  - `index.ts`: 路由入口。
  - `types.ts`: 路由相关类型定义。
  - `modules/`: 模块化路由表。
- **views/**: 业务页面存放位置，按路由划分。
  - 每个页面应为一个独立文件夹：
    - `index.vue`: 主页面。
    - `components/`: 该页面专用的业务组件。
    - `hooks/`: 该页面专用的业务逻辑组合式函数。

### 3. API 层 (API Layer)
- **apis/**: 按业务模块划分接口请求。
  - **公共部分**:
    - `index.ts`: 公共请求封装（Axios 实例、拦截器）。
    - `index.api.ts`: 公共类型定义（通用响应结构等）。
  - **业务模块** (以 `user-manage` 为例):
    - `user-manage/index.ts`: 该模块的 HTTP 请求方法。
    - `user-manage/index.api.ts`: 该模块特有的 TS 类型/模型定义。

### 4. 状态管理 (Store)
- **store/**: Pinia 状态管理。
  - `index.ts`: Store 统一入口。
  - `user.ts`: 示例用户模块 Store。

### 5. 其他核心目录
- **components/**: 全局可复用的公共组件（如 `ErrorPage/403.vue`, `404.vue`）。
- **directives/**: 自定义指令（如 `v-debounce` 防抖, `v-throttle` 节流）。
- **utils/**: 工具函数库（HTTP 状态枚举、本地存储 `storage.ts`、日期格式化等）。
- **styles/**: 全局样式。
  - `reset.scss`: 重置样式。
  - `variables.scss`: 全局变量。
  - `index.scss`: 样式入口。
- **assets/**: 静态资源（图片、SVG、字体等），由 Vite 构建处理。

## 编码规范与最佳实践

1.  **组件开发**: 优先使用 `<script setup>` 和 Composition API。
2.  **类型安全**: 所有 API 请求和返回数据必须定义 TS 接口。
3.  **命名习惯**: 
    - 文件夹使用 `kebab-case`。
    - 组件文件使用 `PascalCase` 或 `kebab-case`（需保持项目内统一）。
    - 变量和函数使用 `camelCase`。
4.  **逻辑解耦**: 复杂的页面逻辑应抽离至 `hooks/` 中。
5.  **全局组件**: 仅将真正的通用组件放入 `src/components`，业务耦合组件应放在对应 `views/` 目录下。

## 适用场景
- **新建页面**: 当用户要求“创建一个用户列表页面”时，应按此规范生成 `views/user-manage/` 及配套的 `apis/user-manage/`。
- **项目初始化/重构**: 检查当前项目是否符合此结构。
- **代码生成**: 自动生成符合规范的模板代码。
