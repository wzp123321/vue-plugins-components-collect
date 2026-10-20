---
title: SideBar 侧边栏
lang: zh-CN
---

# SideBar 侧边栏

SideBar 侧边栏组件，用于内容分类后的展示切换。

## 基础用法

:::demo

mobile/side-bar/basic

:::

## SideBar 属性

|  属性名  |                                                      类型                                                      | 默认值 |                 说明                 |
| :------: | :------------------------------------------------------------------------------------------------------------: | :----: | :----------------------------------: |
| isAnchor |                                                    Boolean                                                     | false  | 是否为锚点功能 true:锚点，false:切页 |
| navList  | ^[Array]`{label: string, isActive: bool, isDisabled: bool, badge: {text: string, type: string, size: string}}` |   []   |          侧边栏标签列表数据          |
|  isIcon  |                                                    Boolean                                                     | false  |           是否为 icon 样式           |

## SideBar 插槽

| slot 名 |       说明       |
| :-----: | :--------------: |
| content |     右侧内容     |
| default | 侧边标签列表内容 |
