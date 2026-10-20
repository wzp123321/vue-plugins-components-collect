---
title: ActionSheet 动作面板
lang: zh-CN
---

# ActionSheet 动作面板

由用户操作后触发的一种特定的模态弹出框 ，呈现一组与当前情境相关的两个或多个选项。

## 基础用法

:::demo

mobile/action-sheet/basic

:::

## ActionSheet 属性

|    属性名    |                  类型                  | 默认值 |     说明     |
| :----------: | :------------------------------------: | :----: | :----------: |
| header-title |                 String                 |   ''   |   顶部标题   |
|   actions    | ^[Array]`{type: string, text: string}` |   -    | 动作按钮列表 |

## ActionSheet 事件

|     事件名      |         说明         |                     返回值                     |
| :-------------: | :------------------: | :--------------------------------------------: |
| @changeSelected | 点击动作按钮触发事件 | `(item: {type: string, text: string}) => void` |

其余属性同：[Popup 弹出层](/zh-CN/mobile/component/popup.md#popup-属性)
