---
title: Tabs 选项卡
lang: zh-CN
---

# Tabs 选项卡

Tabs 选项卡组件，当内容/数据需要一定的分类纬度进行区分，便于用户快速作出选择并切换时可以使用。

## 基础用法

:::demo

mobile/tabs/basic

:::

## Tabs 属性

|      属性名      |                                       类型                                       |           默认值           |                             说明                             |
| :--------------: | :------------------------------------------------------------------------------: | :------------------------: | :----------------------------------------------------------: |
|     current      |                                      Number                                      |             0              |               当前选中的 tab 索引值，从 0 计数               |
|    styleType     |                                      String                                      |           button           | 分段器样式类型，可选值：button（按钮类型），text（文字类型） |
|   activeColor    |                                      String                                      | 'var(--tem-color-primary)' |                  选中的标签背景色与边框颜色                  |
|      values      | ^[Array]`{text: string, badge: string, size: string, type: string, light: bool}` |             -              |                           选项数组                           |
| showBottomBorder |                                     Boolean                                      |            true            |                      是否展示底部分割线                      |
|    isometric     |                                     Boolean                                      |           false            |                        选项间是否等距                        |

## Tabs 事件

|   事件名   |          说明          |       返回值       |
| :--------: | :--------------------: | :----------------: |
| @clickItem | 组件触发点击事件时触发 | `e={currentIndex}` |
| @clickMore |      右侧更多点击      |         -          |
