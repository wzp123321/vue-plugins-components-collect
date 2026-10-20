---
title: 内置过渡动画
lang: zh-CN
---

# 内置过渡动画

Element Plus 内应用在部分组件的过渡动画，你也可以直接使用。 在使用之前，请阅读 [官方的过渡组件文档](https://vuejs.org/guide/built-ins/transition.html)。

## Fade 淡入淡出

:::demo 提供 `te-fade-in-linear` 和 `te-fade-in` 两种效果。

transitions/fade

:::

## Zoom 缩放

:::demo 提供 `te-zoom-in-center`，`te-zoom-in-top` 和 `te-zoom-in-bottom` 三种效果。

transitions/zoom

:::

## Collapse 折叠面板

使用 `te-collapse-transition` 组件实现折叠展开效果。

:::demo

transitions/collapse

:::

## 按需导入

```ts
// collapse
import { TeCollapseTransition } from 'element-plus'
// fade/zoom
import 'element-plus/lib/theme-chalk/base.css'
import App from './App.vue'

const app = createApp(App)
app.component(TeCollapseTransition.name, TeCollapseTransition)
```
