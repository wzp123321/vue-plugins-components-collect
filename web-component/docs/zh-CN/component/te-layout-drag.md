---
title: LayoutDrag
lang: zh-CN
---

## 基础用法

:::demo

te-layout-drag/basic
:::

### Attributes

| 参数           | 说明                          | 类型           | 默认值 |
| -------------- | ----------------------------- | -------------- | ------ |
| mode           | 布局模式                      | ' hor'\|' ver' | 'hor'  |
| left-icon-top  | 折叠 icon 距离顶部/左侧的距离 | string         |
| is-show-expand | 是否显示折叠按钮              | boolean        | true   |
| default-value  | 左侧区域/顶部区域默认宽或高   | number         | 240    |

### Slots

| 插槽名       | 说明            |
| ------------ | --------------- |
|              |
| right-bottom | 右/下侧内容插槽 |
| left-top     | 左/上侧内容插槽 |
