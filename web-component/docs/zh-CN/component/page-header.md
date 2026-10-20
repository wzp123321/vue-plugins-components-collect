---
title: Page Header 页头
lang: zh-CN
---

# Page Header 页头

如果页面的路径比较简单，推荐使用页头组件而非面包屑组件。

## 完整示例

:::demo

page-header/complete

:::

## 基础用法

简单场景下的标准页头。

:::demo

page-header/basic

:::

## 自定义图标

默认图标可能无法满足您的需求，您可以通过设置`icon`属性来自定义图标，示例如下。

:::demo

page-header/custom-icon

:::

## 无图标

有时，页面全是元素，您可能不想展示页面上方的图标，您可以设置`icon`属性值为`null`来去除它。

:::demo

page-header/no-icon

:::

## 面包屑导航

使用页头组件，您可以通过添加插槽 `breadcrumb` 来设置面包屑路由导航。

:::demo

page-header/breadcrumb

:::

## 额外操作部分

头部可能会变得很复杂，您可以在头部添加更多的区块，以允许丰富的交互。

:::demo

page-header/additional-sections

:::

## 主要内容

有时我们想让页头显示一些协同响应内容，我们可以使用 `default` 插槽。

:::demo

page-header/main-content

:::

## 组件插槽结构

本组件由这些部件构成：

```vue
<template>
  <te-page-header>
    <!-- Line 1 -->
    <template #breadcrumb />
    <!-- Line 2 -->
    <template #icon />
    <template #title />
    <template #content />
    <template #extra />
    <!-- Lines after 2 -->
    <template #default />
  </te-page-header>
</template>
```

## API

### Attributes

| 属性名     | 说明                                  | 类型                       | 默认   |
| ------- | ----------------------------------- | ------------------------ | ---- |
| icon    | Page Header 的图标 Icon 组件             | ^[string] / ^[Component] | Back |
| title   | Page Header 的主标题，默认是 Back (内置 a11y) | ^[string]                | ''   |
| content | Page Header 的内容                     | ^[string]                | ''   |

### 事件

| 事件名  | 说明       | 类型                         |
| ---- | -------- | -------------------------- |
| back | 点击左侧区域触发 | ^[Function]`() => void` |

### 插槽

| 名称         | 说明      |
| ---------- | ------- |
| icon       | 图标内容    |
| title      | 标题内容    |
| content    | 内容      |
| extra      | 扩展设置    |
| breadcrumb | 面包屑导航内容 |
| default    | 默认内容    |
