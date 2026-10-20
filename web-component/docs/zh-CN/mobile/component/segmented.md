---
title: Segmented 分段控制器
lang: zh-CN
---

# Segmented 分段控制器

用于多个分项切换。

## 基础用法

:::demo

mobile/segmented/basic

:::

## Segmented 属性

|    属性名     |                   类型                   |              默认值               |             说明             |
| :-----------: | :--------------------------------------: | :-------------------------------: | :--------------------------: |
|     list      |         ^[Array]`{name: string}`         |                []                 |          选项的数组          |
|    current    |              Numbeer/String              |                 0                 | 初始化时默认选中的选项索引值 |
|  activeColor  |                  String                  |  'var(--tem-text-color-primary)'  |         激活时的颜色         |
| inactiveColor |                  String                  | 'var(--tem-text-color-secondary)' |         未激活的颜色         |
|     size      | ^[enum]`'default' \| 'large' \| 'small'` |             'default'             |             尺寸             |
|   animation   |                 Boolean                  |               true                |       是否开启动画效果       |
|     bold      |                 Boolean                  |               false               |   激活 tab 的字体是否加粗    |

## Segmented 事件

| 事件称名 |           说明           |               回调参数                |
| :------: | :----------------------: | :-----------------------------------: |
| @change  | 分段器选项发生改变时触发 | index：选项的 index 索引值，从 0 开始 |
