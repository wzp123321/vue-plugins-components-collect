---
name: 'vue-modular-guard'
description: '引导并执行 Vue 代码模块化拆分；在收到新需求或单文件代码臃肿、复用逻辑出现时调用，拆分为业务组件/公共组件、TypeScript 类型文件、hooks。'
---

# Vue 模块化拆分守护

本技能用于在实现新功能或维护时，避免把所有逻辑塞到单个 `.vue` 文件，自动规划与落地“组件拆分 + 类型抽离 + hooks 提炼”的模块化结构，保持代码可读、可维护、可复用。

## 何时调用

- 新需求实现前：预估页面复杂度，先产出拆分方案
- 单文件超过约 200–300 行或出现多职责（视图/状态/逻辑耦合）
- 出现重复逻辑、跨组件复用逻辑
- 需要梳理/沉淀 TypeScript 类型，或 API/数据模型混杂在视图中

## 核心职责

- 规划：生成模块切分方案与目标路径
- 落地：创建组件/hooks/类型文件骨架并迁移代码
- 规范：统一命名、目录、导出与引用方式
- 校验：确保引用更新、类型正确、页面可运行

## 目录与命名（适配两类目录约定）

- 页面目录：存在 `src/views/` 则优先使用；否则使用 `src/pages/`
- 公共组件：`src/components/`（帕斯卡命名，如 `UserCard.vue`）
- 页面内组件：`<pageDir>/components/`，帕斯卡命名
- hooks（组合式）：`src/hooks/` 或 `<pageDir>/hooks/`，文件命名 `useXxx.ts`
- 类型文件：
  - API 领域模型：`src/apis/models.ts` 或按模块细分 `src/apis/**`
  - 仅页面内部使用：`<pageDir>/types.ts`
- 工具：`src/utils/**`

> 若项目存在自定义规范（如已安装 vue-structure-guard），以既有规范为最高优先级；本技能会自动探测并对齐到已存在目录。

## 拆分判定标准

- 视图组件含有大段业务逻辑/异步请求/状态机 → 提炼为 hooks
- 表单、搜索栏、表格、分页、弹框等可复用 UI 单元 → 拆分业务组件
- 接口请求/数据模型类型与视图耦合 → 抽离到 `apis` 与 `models`
- 跨组件复用的工具函数 → 抽离到 `utils`

## 标准拆分方案（模板）

以“员工管理页”为例（按存在的目录自动选择 views 或 pages）：

- 页面壳：`src/<views|pages>/employee/index.vue`（布局与编排）
- 业务组件：
  - `src/<views|pages>/employee/components/EmployeeSearch.vue`
  - `src/<views|pages>/employee/components/EmployeeTable.vue`
  - `src/<views|pages>/employee/components/EmployeeEditorDialog.vue`
- hooks：
  - `src/<views|pages>/employee/hooks/useEmployee.ts`（数据获取、增删改查、分页、筛选）
- 类型：
  - 页面内类型：`src/<views|pages>/employee/types.ts`
  - API 模型：`src/apis/models.ts` 或 `src/apis/employee.model.ts`
- API：
  - `src/apis/employee.ts`

## 模板片段（最小骨架）

- 组件（SFC）

```vue
<template><div class="x"></div></template>
<script lang="ts" setup>
defineProps<{
  /* props */
}>()
defineEmits<{
  /* events */
}>()
</script>
<style lang="scss" scoped></style>
```

- Hook

```ts
export function useXxx() {
  // state, methods, side effects
  return {
    /* ... */
  }
}
```

- 类型

```ts
export interface XxxVO {
  /* ... */
}
export type Xxx = {
  /* ... */
}
```

## 执行流程

1. 读取项目目录，识别使用 views 还是 pages，确认现有规范
2. 生成“模块切分方案”（含路径、文件清单）
3. 创建缺失目录与文件骨架
4. 迁移 `.vue` 中逻辑至 hooks & 组件，抽离类型
5. 更新 import/export、路由与引用关系
6. 自检：类型检查、页面运行校验

## 验收清单

- 页面文件以编排为主，不含冗长业务逻辑
- 可复用 UI 单元均拆分为组件
- 接口/类型不再耦合于视图层
- hooks 封装：状态、接口、纯逻辑清晰分层
- 代码通过类型检查与基本运行验证

## 示例指令

- “实现员工管理页，请先给出模块化拆分方案并落地骨架”
- “这个组件 500 行了，按规则拆分成子组件 + hooks”
- “把表格查询逻辑抽到 hooks，并抽离类型到 models”

## 边界

- 不涉及跨包/跨项目重构
- 与编码规范冲突时以项目现有规范优先
