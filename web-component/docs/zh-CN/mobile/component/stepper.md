---
title: Stepper 步进器组件
lang: zh-CN
---

# Stepper 步进器组件

Stepper 步进器组件，是一个带有加减按钮的数字输入控件，常用于数量调整或其他需要精确控制数值增量的场景。

## 基础用法

:::demo

mobile/stepper/basic

:::

## Stepper 属性

| 属性名   | 类型    | 描述                             | 可选值                       | 默认值  |
| -------- | ------- | -------------------------------- | ---------------------------- | ------- |
| size     | String  | 组件尺寸                         | 'small' / 'medium' / 'large' | 'small' |
| value    | Number  | 输入框当前值                     | —                            | 1       |
| min      | Number  | 最小允许值                       | —                            | 0       |
| max      | Number  | 最大允许值                       | —                            | 100     |
| step     | Number  | 每次点击加减按钮增加或减少的值量 | —                            | 1       |
| disabled | Boolean | 是否禁用步进器，不可点击或编辑   | true / false                 | false   |

## Stepper 事件

| 事件名 | 回调函数签名    | 描述                                                |
| ------ | --------------- | --------------------------------------------------- |
| change | `(value) => {}` | 当输入框值发生改变时触发，回调参数为当前的 value 值 |
| focus  | `(event) => {}` | 当输入框获得焦点时触发，回调参数为原生 event 对象   |
| blur   | `(event) => {}` | 当输入框失去焦点时触发，回调参数为原生 event 对象   |
