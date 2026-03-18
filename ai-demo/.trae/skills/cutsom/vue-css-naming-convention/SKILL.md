---
name: "vue-css-naming-convention"
description: "提供 Vue 项目中页面 CSS 的命名规范。在编写页面样式或重构 CSS 时使用此技能。"
---

# Vue 页面 CSS 命名规范

本规范旨在为 Vue 项目提供一套统一的 CSS 命名约定，以提高代码的可读性、可维护性和可扩展性。

## 核心原则

- **BEM (Block, Element, Modifier)**: 规范借鉴了 BEM 的思想，但进行了简化，使其更适用于基于组件的 Vue 开发模式。
- **范围化 (Scoping)**: 所有样式都应明确其所属的页面或组件范围，避免全局污染。

## 命名规则

### 1. 页面根元素 (Block)

- **格式**: `[page-name]`
- **说明**:
    - 页面最外层的 class 名称应直接使用页面名称。
    - 采用全小写形式。
    - 如果页面名称由多个单词组成，使用中划线 `-` 连接。
- **示例**:
    - 用户管理 (User Manage) 页面 -> `user-manage`
    - 首页 (Home) -> `home`
    - 产品详情 (Product Detail) -> `product-detail`

```vue
<template>
  <div class="user-manage">
    <!-- 页面内容 -->
  </div>
</template>
```

### 2. 子元素 (Element)

- **格式**: `[page-abbreviation]-[element-name]`
- **说明**:
    - 页面内部的子元素 class 名称需要添加统一的前缀。
    - 前缀由页面名称的缩写和一个中划线 `-` 组成。
    - 元素名称应清晰地描述其功能或结构。
- **如何选择缩写?**:
    - 通常取页面名称中每个单词的首字母。
    - 例如，`user-manage` 的缩写是 `um`。
    - `product-detail` 的缩写是 `pd`。
- **示例**:
    - 用户管理页面的头部: `um-header`
    - 用户管理页面的内容区域: `um-content`
    - 用户管理页面的表格: `um-table`
    - 用户管理页面的分页器: `um-pagination`

```vue
<template>
  <div class="user-manage">
    <header class="um-header">...</header>
    <main class="um-content">
      <div class="um-table">...</div>
    </main>
    <footer class="um-footer">
      <div class="um-pagination">...</div>
    </footer>
  </div>
</template>
```

### 3. 状态或变体 (Modifier)

- **格式**: `[block-or-element]--[state]`
- **说明**:
    - 当元素有不同的状态（如 `active`, `disabled`）或变体（如 `primary`, `danger`）时，使用两个中划线 `--` 连接状态名。
- **示例**:
    - `um-button--primary`
    - `um-table-row--selected`
    - `um-input--disabled`

## 实践建议

- **保持一致**: 在整个项目中严格遵守此命名规范。
- **组件内部样式**: 对于 Vue 的单文件组件 (SFC)，建议使用 `<style scoped>` 来将样式限定在组件内部，这可以与本命名规范结合使用，提供更强的隔离性。
- **清晰的缩写**: 确保页面缩写是唯一且易于理解的。可以在项目的文档中维护一个页面缩写列表。

在创建新页面或重构现有页面时，请遵循此规范来组织您的 CSS 类名。