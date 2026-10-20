---
title: CollapseGroup 折叠面板
lang: zh-CN
---

# CollapseGroup 折叠面板

CollapseGroup 组件用于展示可以折叠和展开的内容区域，需与 `Collapse` 组件一同使用。

## 基础用法

:::demo

mobile/collapse/basic

:::

## CollapseGroup 属性

| 属性名      | 类型            | 描述                                                                            | 默认值  |
| ----------- | --------------- | ------------------------------------------------------------------------------- | ------- |
| `value`     | `String\|Array` | 当前激活面板改变时触发。如果是手风琴模式，参数类型为 `string`；否则为 `array`。 | `''`    |
| `accordion` | `Boolean`       | 是否开启手风琴效果，默认值为 `false`，即默认不开启手风琴模式。                  | `false` |

## CollapseGroup 事件

| 事件名   | 参数类型   | 描述                                                                    |
| -------- | ---------- | ----------------------------------------------------------------------- |
| `change` | `Function` | 切换面板时触发，如果是手风琴模式，返回类型为 `string`；否则为 `array`。 |

# Collapse 折叠面板子组件

Collapse 折叠面板子组件是专为与 `CollapseGroup` 组件配合使用的组件，用于展示可折叠内容区域。

## Collapse 属性

| 属性名        | 类型    | 描述                      | 默认值  |
| ------------- | ------- | ------------------------- | ------- |
| title         | String  | 标题文字                  | `''`    |
| thumb         | String  | 标题左侧缩略图            | `''`    |
| name          | String  | 唯一标志符                | `''`    |
| open          | Boolean | 是否展开组件              | `false` |
| titleBorder   | Boolean | 是否显示标题分隔线        | `true`  |
| border        | Boolean | 是否显示分隔线            | `true`  |
| disabled      | Boolean | 是否禁止展开面板          | `false` |
| showAnimation | Boolean | 是否启用展开/关闭动画效果 | `true`  |
| showArrow     | Boolean | 是否显示右侧箭头图标      | `true`  |
