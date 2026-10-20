---
title: Dialog 对话框
lang: zh-CN
---

# Dialog 对话框

一种打断当前操作的模态视图，用于显示重要提示或请求用户进行重要操作。

## 基础用法

:::demo

mobile/dialog/basic

:::

## Dialog 属性

|    属性名    |     类型      | 默认值 |                                         说明                                         |
| :----------: | :-----------: | :----: | :----------------------------------------------------------------------------------: |
|     mode     |    String     |  base  |             对话框模式，可选值：base（提示对话框）/input（可输入对话框）             |
|    title     |    String     |   -    |                                      对话框标题                                      |
|   content    |    String     |   -    |                             对话框内容，base 模式下生效                              |
|    value     | String\Number |   -    |                            输入框默认值，input 模式下生效                            |
| placeholder  |    String     |   -    |                           输入框提示文字，input 模式下生效                           |
| before-close |    Boolean    | false  | 是否拦截按钮事件，如为 true，则不会关闭对话框，关闭需要手动执行 dialog 的 close 方法 |

## Dialog 事件

| 事件称名 |           说明           |               返回值               |
| :------: | :----------------------: | :--------------------------------: |
|  close   | 点击 dialog 取消按钮触发 |                 -                  |
| confirm  | 点击 dialog 确定按钮触发 | `e={value:input 模式下输入框的值}` |

## Dialog 插槽

|  名称   |               说明               |
| :-----: | :------------------------------: |
| default | 自定义内容，会覆盖原有的内容显示 |
