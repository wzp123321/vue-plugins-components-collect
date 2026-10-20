---
title: Descriptions 描述列表
lang: zh-CN
---

# Descriptions 描述列表

列表形式展示多个字段。

## 基础用法

:::demo

descriptions/basic-usage

:::

## 不同尺寸

:::demo

descriptions/sizes

:::

## 垂直列表

:::demo

descriptions/vertical-list

:::

## 自定义样式

:::demo

descriptions/customized-style

:::

## Descriptions API

### Descriptions Attributes

| 属性名       | 说明                         | 类型                                                | 默认         |
| --------- | -------------------------- | ------------------------------------------------- | ---------- |
| border    | 是否带有边框                     | ^[boolean]                                        | false      |
| column    | 一行 `Descriptions Item` 的数量 | ^[number]                                         | 3          |
| direction | 排列的方向                      | ^[enum]`'vertical' \| 'horizontal'`              | horizontal |
| size      | 列表的尺寸                      | ^[enum]`'' \| 'large' \| 'default' \| 'small'` | —          |
| title     | 标题文本，显示在左上方                | ^[string]                                         | ''         |
| extra     | 操作区文本，显示在右上方               | ^[string]                                         | ''         |

### Descriptions Slots

| 插槽名     | 说明            | 子标签               |
| ------- | ------------- | ----------------- |
| default | 自定义默认内容       | Descriptions Item |
| title   | 自定义标题，显示在左上方  | —                 |
| extra   | 自定义操作区，显示在右上方 | —                 |

## DescriptionsItem API

### DescriptionsItem Attributes

| 属性名              | 说明                                                                                                   | 类型                                       | 默认   |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| label            | 标签文本                                                                                                 | ^[string]                                | ''   |
| span             | 列的数量                                                                                                 | ^[number]                                | 1    |
| width            | 列的宽度，不同行相同列的宽度按最大值设定（如无 `border` ，宽度包含标签与内容）                                                         | ^[string] / ^[number]                    | ''   |
| min-width        | 列的最小宽度，与 `width` 的区别是 `width` 是固定的，`min-width` 会把剩余宽度按比例分配给设置了 `min-width` 的列（如无 `border`，宽度包含标签与内容） | ^[string] / ^[number]                    | ''   |
| align            | 列的内容对齐方式（如无 `border`，对标签和内容均生效）                                                                      | ^[enum]`'left' \| 'center' \| 'right'` | left |
| label-align      | 列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 `border`，请使用 `align` 参数）                                               | ^[enum]`'left' \| 'center' \| 'right'` | ''   |
| class-name       | 列的内容自定义类名                                                                                            | ^[string]                                | ''   |
| label-class-name | column label custom class name                                                                       | ^[string]                                | ''   |

### DescriptionsItem Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |
| label   | 自定义标签   |
