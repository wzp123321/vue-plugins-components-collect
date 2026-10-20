---
title: Text
lang: zh-CN
---

# Text

文本的常见操作

## 基础用法

:::demo 由 `type` 属性来选择 Text 的类型。

text/basic

:::

## 尺寸

:::demo 使用 `size` 属性配置尺寸，可选的尺寸大小有: `large`, `default` 或 `small`

text/sizes

:::

## 省略

:::demo 通过 ` truncated ` 属性，在文本超过视图或最大宽度设置时展示省略符。 通过 `line-clamp` 属性控制多行的样式

text/truncated

:::

## 覆盖

:::demo 使用属性 `tag` 覆盖元素

text/override

:::

## 混合使用

:::demo 混合使用 Text 组件

text/mixed

:::

## API

### Attributes

| 属性名                 | 描述      | 类型                                                                     | 默认值     |
| ------------------- | ------- | ---------------------------------------------------------------------- | ------- |
| type                | 类型      | ^[enum]`'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | —       |
| size                | 大小      | ^[enum]`'large' \| 'default' \| 'small'`                             | default |
| truncated           | 显示省略号   | ^[boolean]                                                             | false   |
| line-clamp ^(2.4.0) | 最大行数    | ^[string] / ^[number]                                                  | -       |
| tag                 | 自定义元素标签 | ^[string]                                                              | span    |

### Slots

| 名称      | 详情   |
| ------- | ---- |
| default | 默认内容 |
