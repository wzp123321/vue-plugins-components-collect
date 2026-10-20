---
title: Rate 评分
lang: zh-CN
---

# Rate 评分

Rate 评分组件，用于对某行为/事物进行打分。

## 基础用法

:::demo

mobile/rate/basic

:::

## Rate 属性

|    属性名     |  类型   | 默认值  |                         说明                          |
| :-----------: | :-----: | :-----: | :---------------------------------------------------: |
| value/v-model | Number  |    0    |                       当前评分                        |
|     color     | String  | #ececec |                 未选中状态的星星颜色                  |
|  activeColor  | String  | #ffca3e |                  选中状态的星星颜色                   |
| disabledColor | String  | #c0c0c0 |                  禁用状态的星星颜色                   |
|     size      | Number  |   24    |                      星星的大小                       |
|      max      | Number  |    5    |           最大评分评分数量，目前一分一颗星            |
|    margin     | Number  |    0    |                  星星的间距，单位 px                  |
|    isFill     | Boolean |  true   |              星星的类型，是否为实心类型               |
|   disabled    | Boolean |  false  | 是否为禁用状态 (之前版本为已读状态，现更正为禁用状态) |
|   readonly    | Boolean |  false  |                    是否为只读状态                     |
|   allowHalf   | Boolean |  false  |                     是否展示半星                      |
|   touchable   | Boolean |  true   |                   是否支持滑动手势                    |

## Rate 事件

| 事件称名 |        说明         |        返回参数        |
| :------: | :-----------------: | :--------------------: |
| @change  | 改变 value 的值返回 | `e = { value:number }` |
