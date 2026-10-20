---
title: Switch 开关
lang: zh-CN
---

# Switch 开关

用于控制某个功能的开启和关闭。

## 基础用法

:::demo

mobile/switch/basic

:::

## Switch 属性

| 属性名            | 说明           | 类型                          | 默认值  |
| ----------------- | -------------- | ----------------------------- | ------- |
| checked           | 是否选中       | Boolean                       | false   |
| size              | 尺寸           | ^[enum]`large、medium、small` | 'large' |
| disabled          | 是否禁用       | Boolean                       | false   |
| activeColor       | 开启时颜色     | String                        | ''      |
| inactiveColor     | 关闭时颜色     | String                        | ''      |
| activeText        | 开启时标题     | String                        | ''      |
| inactiveText      | 关闭时标题     | String                        | ''      |
| activeTextColor   | 开启时标题颜色 | String                        | ''      |
| inactiveTextColor | 关闭时标题颜色 | String                        | ''      |

## Switch 事件

| 事件名 | 回调函数签名                    | 描述                           |
| ------ | ------------------------------- | ------------------------------ |
| change | `event.detail={ value:checked}` | checked 改变时触发 change 事件 |
