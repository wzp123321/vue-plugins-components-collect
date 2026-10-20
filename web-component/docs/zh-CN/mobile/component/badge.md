---
title: Badge 数字徽标组件
lang: zh-CN
---

# Badge 数字徽标组件

Badge 组件是一个数字徽标，通常与其他控件如列表、九宫格等配合使用，用于展示数量提示，默认样式为实心灰色背景。

## 基础用法

:::demo

mobile/badge/basic

:::

## Badge 属性

| 属性名      | 类型            | 描述                                                                                      | 可选值                                            | 默认值   |
| ----------- | --------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | -------- |
| displayMode | String          | 显示类型                                                                                  | 'normal', 'dot', 'subscript', 'bubble'            | 'normal' |
| text        | String          | 徽标内容                                                                                  | —                                                 | ''       |
| size        | String          | 尺寸                                                                                      | 'medium', 'large'                                 | 'medium' |
| type        | String          | 颜色类型                                                                                  | 'info', 'primary', 'success', 'warning', 'danger' | 'info'   |
| inverted    | Boolean         | 是否无需背景颜色                                                                          | true / false                                      | false    |
| light       | Boolean         | 是否显示为浅色                                                                            | true / false                                      | false    |
| maxNum      | Number          | 展示封顶的数字值，超过该值显示为 '99+'                                                    | —                                                 | 99       |
| offset      | Array\[number\] | 相对于定位角中心点的偏移量，格式为 `[水平偏移, 垂直偏移]`，负数表示外偏移，正数表示内偏移 | —                                                 | [-5, -5] |

## Badge 事件

| 事件名 | 回调函数     | 描述                    |
| ------ | ------------ | ----------------------- |
| click  | `() => void` | 点击 Badge 时触发的事件 |
