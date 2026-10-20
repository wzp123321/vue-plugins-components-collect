---
title: Button 按钮
lang: zh-CN
---

# Button 按钮

常用的操作按钮。

## 基础用法

:::demo 使用 `type`、`plain`、`round`、`icon` 和 `circle` 来定义按钮的样式。

mobile/button/basic

:::

## Button 属性

| 属性名   | 说明               | 类型                                                 | 默认值  |
| -------- | ------------------ | ---------------------------------------------------- | ------- |
| type     | 类型               | ^[enum]`'default' \| 'primary'\| 'light'\| 'danger'` | default |
| plain    | 是否为朴素按钮     | ^[boolean]                                           | false   |
| text     | 是否为文字按钮     | ^[boolean]                                           | false   |
| link     | 是否为链接按钮     | ^[boolean]                                           | false   |
| round    | 是否为圆角按钮     | ^[boolean]                                           | false   |
| circle   | 是否为圆形按钮     | ^[boolean]                                           | false   |
| disabled | 按钮是否为禁用状态 | ^[boolean]                                           | false   |
| size     | 尺寸               | ^[enum]`'large' \| 'medium'\| 'small'`               | large   |

## Button 插槽

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 自定义默认内容 |

其余属性同：[tem-button](https://uniapp.dcloud.net.cn/component/button.html)
