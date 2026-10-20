---
title: Result 结果
lang: zh-CN
---

# Result 结果

用于对用户的操作结果或者异常状态做反馈。

## 基础用法

:::demo

result/basic-usage

:::

## 自定义内容

:::demo

result/customized-content

:::

## API

### Attributes

| 属性名       | 说明             | 类型                                                      | 默认值  |
| --------- | -------------- | ------------------------------------------------------- | ---- |
| title     | result 组件的标题   | ^[string]                                               | ''   |
| sub-title | result 组件的副标题  | ^[string]                                               | ''   |
| icon      | result 组件的图标类型 | ^[enum]`'success' \| 'warning' \| 'info' \| 'error'` | info |

### 插槽

| 名称        | 说明               |
| --------- | ---------------- |
| icon      | icon 内容          |
| title     | result title 的内容 |
| sub-title | sub title 的内容    |
| extra     | 内容额外区域的内容        |
