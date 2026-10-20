---
title: Cell 单元格组件
lang: zh-CN
---

# Cell 单元格组件

Cell 组件是一个用于展示数据的单元格视图组件，适用于列表项、表格项等多种布局场景，提供了丰富的可配置属性及交互事件。

## 基础用法

:::demo

mobile/cell/basic

:::

## Cell 属性

| 属性名           | 类型                           | 描述                 | 默认值         |
| ---------------  | ------------------------------ | -------------------- | -------------- |
| titleText        | String                         | 单元格的标题文字     | `''`           |
| require          | Boolean                        | 是否为必填项         | 未设置         |
| layout           | `'vertical'` \| `'horizontal'` | 单元格的布局方式     | `'horizontal'` |
| descriptionText  | String                         | 单元格的描述信息     | `''`           |
| showArrow        | Boolean                        | 是否显示右侧箭头     | `false`        |
| showLeft         | Boolean                        | 是否显示左侧内容     | `true`         |
| showContent      | Boolean                        | 是否显示主体内容     | `true`         |
| centerLeft       | Boolean                        | 左侧内容是否垂直居中 | `true`         |
| show-bottom-line | Boolean                        | 是否显示底部横线     | `true`         |
| arrow-position   | `'right'` \| `'title-right'`   | 箭头显示位置，`title-right` 表示显示在标题右侧 | `right`|

## Cell 事件

| 事件名 | 回调函数                                                   | 描述                                                                                                                                                                                      |
| ------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| click  | `(type: 'cell' \| 'left' \| 'content' \| 'arrow') => void` | 点击单元格不同区域时触发，返回点击位置的类型。具体类型含义如下：`'cell'`: 整个单元格被点击<br> `'left'`: 左侧内容被点击<br> `'content'`: 主体内容区域被点击<br> `'arrow'`: 右侧箭头被点击 |
