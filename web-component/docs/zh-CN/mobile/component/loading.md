---
title: Loading 加载组件
lang: zh-CN
---

# Loading 加载组件

Loading 加载组件是一个用于在数据加载或处理过程中展示加载状态的 UI 元素，支持多种布局样式和尺寸。

## 基础用法

:::demo

mobile/loading/basic

:::

## Loading 属性

| 属性名      | 类型    | 描述             | 可选值                                   | 默认值       |
| ----------- | ------- | ---------------- | ---------------------------------------- | ------------ |
| showIcon    | Boolean | 是否显示加载图标 | true / false                             | true         |
| mask        | Boolean | 是否显示遮罩层   | true / false                             | false        |
| showText    | Boolean | 是否显示加载文字 | true / false                             | true         |
| loading     | Boolean | 是否处于加载状态 | true / false                             | true         |
| loadingText | String  | 加载时显示的文字 | —                                        | '加载中...'  |
| layout      | String  | 布局方式         | 'vertical' / 'horizontal'                | 'horizontal' |
| size        | String  | 组件尺寸         | 'small' / 'medium' / 'large'             | 'small'      |
| type        | String  | 加载样式         | 'circular' / 'spinner' / 'dots' / 'line' | 'circular'   |
