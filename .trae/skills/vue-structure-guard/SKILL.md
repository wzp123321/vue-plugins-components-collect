---
name: 'vue-structure-guard'
description: '规范并校验 Vue 项目目录结构；在创建/移动/重命名文件夹或文件、生成脚手架、新增组件/页面时调用。'
---

# Vue 目录结构规范守护

本技能在你提出“创建/移动/重命名/删除文件或文件夹”“新增页面/组件/路由/状态/样式”等需求时接管操作，确保所有路径与命名符合既定 Vue 工程目录规范；必要时自动纠正到规范路径，并可生成最小可用模板。

## 何时调用

- 当用户要求创建、移动、重命名、删除任意文件/文件夹
- 当用户新增页面、组件、路由、指令、API、样式、Store 等
- 当用户生成脚手架或添加示例文件

## 核心职责

- 校验：校验目标路径是否符合白名单与命名规范
- 纠正：不合规时给出 1–3 个合规候选路径；若用户未指明，默认选择最合理路径并执行
- 构建：自动创建缺失的父目录
- 模板：为关键文件提供最小可用模板（可选）
- 拒绝：根目录创建非白名单文件/目录时拒绝并提供改正方案

## 顶层白名单

允许的根目录与文件（其余一律拒绝或重定向）：

- 目录：`public/`、`src/`
- 文件：`.env`、`.env.production`、`.eslintignore`、`.eslintrc.json`、`.gitignore`、`.prettierignore`、`.prettierrc`、`.stylelintignore`、`.stylelintrc`、`commitlint.config.ts`、`package-lock.json`、`package.json`、`tsconfig.json`、`tsconfig.node.json`、`vite.config.ts`

## src 目录结构与规则

- 顶层文件：`src/App.vue`、`src/main.ts`、`src/vite-env.d.ts`
- 目录与要点：
  - `src/views/`：页面组件，文件名使用帕斯卡命名（如 `HelloWorld.vue`）
  - `src/utils/`：工具与请求
    - 固定文件：`httpStatusEnums.ts`、`index.ts`、`request.ts`、`storage.ts`
    - 允许新增其他工具文件，如 `helpers.ts`
  - `src/styles/`：全局样式
    - 固定文件：`global.scss`、`index.scss`、`reset.scss`、`variable.scss`
    - 组件级样式：`styles/components/index.scss`
  - `src/store/`：Pinia Store，示例：`user.ts`；允许新增模块，如 `auth.ts`
  - `src/router/`：
    - `index.ts`
    - `types/typings.d.ts`
    - `modules/`：允许多个业务路由表文件（含示例 `global.ts`、`routes.ts`）
    - `config/nprogress.ts`
  - `src/directives/`：
    - `index.ts`
    - `directives/debounce.ts`、`directives/throttle.ts`（允许新增）
  - `src/components/`：
    - 全局组件与子目录，示例：`ErrorMessage/403.vue`、`ErrorMessage/404.vue`
  - `src/assets/`：静态资源，示例：`vue.svg`
  - `src/apis/`：请求集合与模型，示例：公共部分为`/apis/index.ts`、`/apis/index.api.ts`;业务模块为`/apis/user-manage/index.ts`、`/apis/user-manage/index.api.ts`,其中.ts文件为公共http请求存放文件，.api.ts文件为类型或者枚举存放文件

## 命名规范

- 组件文件：帕斯卡命名（如 `UserCard.vue`）
- 目录：小写短横线或帕斯卡（与现有保持一致）
- TypeScript/样式文件：小写短横线或驼峰，保持与现有示例一致（如 `request.ts`、`global.scss`）

## 执行策略

当收到创建/移动请求时，按以下流程处理：

1. 解析意图（页面/组件/路由/指令/样式/Store/API/静态）与期望文件名
2. 匹配白名单与目录规则，确定“规范路径”
3. 若用户路径不合规：
   - 提供 1–3 个规范候选路径并说明原因
   - 用户未指定时，默认采用最合理候选路径
4. 自动创建缺失父目录
5. 根据类型（可选）写入最小模板；否则创建空文件
6. 输出变更说明与后续接入提示（如在 `router/modules` 注册路由）

## 最小模板（可选）

当用户未提供内容且类型明确时，可写入以下模板的最小版本：

- Vue 组件：基础 `<script setup lang="ts">` + `<template>`
- Pinia Store：`defineStore` 最小骨架
- 路由模块：导出 `RouteRecordRaw[]`
- 样式：空文件含注释块标识用途
- API 模块：导出函数的空实现与类型占位

## 常见场景

- “创建 utils/helpers.ts” → 重定向为 `src/utils/helpers.ts`
- “新建页面 Login.vue” → 创建 `src/views/Login.vue`
- “新增全局组件 Toast.vue” → 创建 `src/components/Toast.vue`
- “加一个业务路由 product.ts” → 创建 `src/router/modules/product.ts`
- “加指令 v-permission” → 创建 `src/directives/directives/permission.ts` 并在 `src/directives/index.ts` 提示注册
- “新增 API 模块 user-manage.ts” → 创建 `src/apis/user-manage/index.ts` 与 `src/apis/user-manage/index.api.ts`

## 约束与边界

- 不允许在根目录创建非白名单文件/目录
- 不覆盖已有文件，除非用户明确选择覆盖
- 路径别名与构建配置不在本技能范围（由工程配置处理）

## 示例指令

- “在项目中新增页面 UserProfile.vue”
- “创建全局组件 ErrorBoundary.vue”
- “新增 pinia 模块 auth.ts”
- “添加业务路由表 order.ts”
- “新增 API 模块 payment.ts”

## 预期工程前提

- Vue 3 + Vite + TypeScript
- 使用 Pinia、SCSS（根据目录体现）

---

实施者须优先确保路径合规；当存在多种可选路径时，务必给出清晰理由与推荐顺序，并优先选择能保持目录语义一致性的路径方案。
