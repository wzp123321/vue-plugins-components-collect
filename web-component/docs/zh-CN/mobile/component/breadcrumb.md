---
title: Breadcrumb 面包屑
lang: zh-CN
---

# Breadcrumb 面包屑

显示当前页面在层级结构的位置，并能返回之前任意层级的页面。

## 基础用法

:::demo

mobile/breadcrumb/basic

:::

## Breadcrumb 属性

|     属性名     |           类型           | 默认值  |       说明       |
| :------------: | :----------------------: | :-----: | :--------------: |
|   separator    |          String          | 斜杠'/' |      分隔符      |
| separatorClass |          String          |         | 图标分隔符 class |
|    options     | ^[Array]`{text: string}` |         |     选项集合     |

## Breadcrumb 事件

|          事件称名           |     说明     |      返回参数      |
| :-------------------------: | :----------: | :----------------: |
| @onBreadcrumbItemClickEvent | 选项点击事件 | `e={text: string}` |

## Breadcrumb 插槽

| 插槽称名 |  说明  |
| :------: | :----: |
| default  | 内容区 |
