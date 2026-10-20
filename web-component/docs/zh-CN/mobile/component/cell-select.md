---
title: CellSelect 单元格选择器布局组件
lang: zh-CN
---

# CellSelect 单元格选择器布局组件

CellSelect 组件是一款专为实现单元格选择器布局设计的视图组件，可用于构建多样化的选择器界面。

## 基础用法

:::demo

mobile/cell-select/basic

:::

## CellSelect 属性

| 属性名     | 类型                           | 描述                                                 | 默认值         |
| ---------- | ------------------------------ | ---------------------------------------------------- | -------------- |
| titleText  | String                         | 单元格选择器的标题文本                               | `''`           |
| require    | Boolean                        | 是否为必选项                                         | `false`        |
| layout     | `'vertical'` \| `'horizontal'` | 布局方式，可选垂直或水平布局                         | `'horizontal'` |
| tips       | String                         | 提示信息文本                                         | `''`           |
| selectText | Boolean                        | 是否显示主体内容                                     | `true`         |
| disabled   | Boolean                        | 是否禁用选择功能，若为 `true` 则用户不能进行选择操作 | `false`        |

## CellSelect 事件

| 事件名 | 回调函数                        | 描述                                                                    |
| ------ | ------------------------------- | ----------------------------------------------------------------------- |
| click  | `(type: 'selectClick') => void` | 点击整个单元格选择器时触发此事件，目前仅支持 `selectClick` 这一种类型。 |
