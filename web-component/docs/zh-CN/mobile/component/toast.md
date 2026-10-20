---
title: Toast 轻提示
lang: zh-CN
---

# Toast 轻提示

用于轻量级反馈或提示，不会打断用户操作。

## 基础用法

:::demo

mobile/toast/basic

:::

## Toast 属性

|  属性名  |                  类型                  |  默认值   |                                          说明                                          |
| :------: | :------------------------------------: | :-------: | :------------------------------------------------------------------------------------: |
|   type   | ^[enum]`success/warning/loading/error` | 'success' |                                          主题                                          |
| showIcon |                Boolean                 |   false   |                                     是否显示 icon                                      |
| maskShow |                Boolean                 |   false   |                                    是否显示背景遮罩                                    |
| duration |                 Number                 |   3000    | 消息显示时间，超过显示时间组件自动关闭，设置为 0 将不会关闭，需手动调用 close 方法关闭 |

## Toast 方法

|  方法称名  | 说明 | 参数 |
| :--------: | :--: | :--: |
| showToast  | 展示 |  -   |
| closeToast | 关闭 |  -   |

## Toast 插槽

|  名称   |               说明               |
| :-----: | :------------------------------: |
| default | 自定义内容，会覆盖原有的内容显示 |
