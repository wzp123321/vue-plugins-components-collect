---
title: 搜索布局组件
lang: zh-CN
---

## 基础用法

:::demo

te-tablebar/basic

:::

## API

### 属性（props）

| 属性名 | 说明 | 类型 | 是否必要 | 默认值 |
| ------ | ---- | ---- | -------- | ------ |
| hiddenMoreSearch | 是否隐藏更多搜索 | bool | 否 | false |

`inupt`输入框属性参考：[Input 输入框](/zh-CN/component/input.md#attributes)

### 事件（events）

| 事件名 | 说明 | 接受参数 |
| ------ | ---- | -------- |
| onQuery | 搜索点击 | 无 |
| onReset | 重置点击 | 无 |
| onRefresh | 刷新点击 | 无 |

### 插槽（slots）

| 插槽名 | 说明 | 作用域 |
| ------ | ---- | ------ |
| header | 头部插槽 | 无 |
| suffix | 尾部插槽 | 无 |
| searchList | 搜索列表插槽 | 无 |
| footer | 底部区插槽 | 无 |
| input | 搜索框区域插槽 | 无 |
