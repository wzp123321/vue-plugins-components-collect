---
title: Popover 弹出气泡
lang: zh-CN
---

# Popover 弹出气泡

用于文字提示的气泡框。

## 基础用法

:::demo

mobile/popover/basic

:::

## Popover 属性

|  属性名   |                             类型                              |     默认值     |     说明     |
| :-------: | :-----------------------------------------------------------: | :------------: | :----------: |
|  options  |           ^[Array]`{icon: component, text: string}`           |       []       |   选项列表   |
|   theme   |                      ^[enum]`light\dark`                      |    'light'     |   主题样式   |
| placement | ^[enum]`bottom-start\bottom\bottom-end\top-start\top\top-end` | 'bottom-start' | 气泡弹出位置 |

## Popover 事件

|   事件称名   |         说明         |              返回参数               |
| :----------: | :------------------: | :---------------------------------: |
|   @select    |     选项选中事件     | `e={icon: component, text: string}` |
| @handleClick | 触发气泡弹出点击事件 |         `e={show: Boolean}`         |

## Popover 插槽

| 插槽称名 |     说明     |
| :------: | :----------: |
| default  | 触发气泡弹出 |
| content  |  气泡内容区  |
