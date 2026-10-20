---
title: Tooltip V2 虚拟化文字提示
lang: zh-CN
---

# Tooltip V2

对于现有的 Tooltip 来说，它有太多的 API，这些 API 不是非常直观和易于获取的。 所以我们创建了这个简单得多的工具提示。它只做了一件简单的事情 — 显示提示信息。 虽然两者结构相似，但 API 是不同的。 在这个版本中，我们单独提供了组件。你可以通过使用组件来创建自己的工具提示。

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (e.g: [VitePress](https://vitepress.vuejs.org/)).

:::

## 基础用法

在图标上以 **Hover** 或者 **tab** 方式触发文字提示。

:::demo

tooltip-v2/basic-usage

:::

## 可访问性友好的文字提示

:::demo

tooltip-v2/a11y

:::

## 转场/动画

你可能会通过`CSS`或者 [Transition](https://vuejs.org/guide/built-ins/transition.html#transition)组件为您的文字提示设置打开过渡（动画）

:::tip

默认情况下，tooltip-v2 只会在文字提示被打开时显示过渡动画。 因为该组件实现是以 `v-if` 表示文字提示的展示或隐藏。 在关闭时，元素的内容将会从DOM中移除，因此过渡动画将会被中断。

:::

:::demo

tooltip-v2/transition

:::

### 完全过渡

当然，你可以对于文字提示的内容有完整的过渡。 但是这需要 [Transition](https://vuejs.org/guide/built-ins/transition.html#transition) 组件，请查看如下演示。

:::demo

tooltip-v2/full-transition

:::

## 渲染到根元素

默认地，不像 [tooltip v1](./tooltip.md)，文字提示将会被渲染至body元素。 **tooltip v2**将会被渲染到触发或表现的元素上。 但是你仍然可以使用 `Teleport` 将它渲染到根元素。

:::demo

tooltip-v2/render-to-root

:::

## 带箭头

:::demo

tooltip-v2/arrow

:::

<!-- ## Composing your own tooltip

## Tooltip V2 APIs

### Tooltip Root

### Tooltip Trigger

### Tooltip Content

### Tooltip Arrow

### Tooltip Reference -->
