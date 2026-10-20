---
title: TabBar 标签栏
lang: zh-CN
---

# TabBar 标签栏

TabBar 标签栏组件，用于在不同功能模块之间进行快速切换，位于页面底部。

## 基础用法

:::demo

mobile/nav-bar/basic

:::

## NavBar 属性

|     属性名      |             类型              |  默认值  |         说明         |
| :-------------: | :---------------------------: | :------: | :------------------: |
|      title      |            String             |    -     |       标题文字       |
|   titleAlign    | 'center' \| 'left' \| 'right' | 'center' |   标题文字对齐方式   |
|    leftBack     |            Boolean            |  false   | 是否展示左侧按钮返回 |
|    leftClose    |            Boolean            |  false   | 是否展示左侧按钮关闭 |
|      color      |            String             | #000000  |    图标和文字颜色    |
| backgroundColor |            String             | #FFFFFF  |    导航栏背景颜色    |
|      fixed      |            Boolean            |  false   |     是否固定顶部     |
|    statusBar    |            Boolean            |  false   |    是否包含状态栏    |
|     shadow      |            Boolean            |  false   |  导航栏下是否有阴影  |

## NavBar 事件

|   事件名    |        说明        | 返回值 |
| :---------: | :----------------: | :----: |
| @clickLeft  | 左侧按钮点击时触发 |   -    |
| @clickRight | 右侧按钮点击时触发 |   -    |

## NavBar 插槽

开发者使用 NavBar 时，支持向 NavBar 里插入不同内容，以达到自定义的目的。

| slot 名 |       说明       |
| :-----: | :--------------: |
|  left   | 向导航栏左侧插入 |
|  right  | 向导航栏右侧插入 |
| default | 向导航栏中间插入 |
