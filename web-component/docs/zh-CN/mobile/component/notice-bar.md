---
title: NoticeBar 公告栏
lang: zh-CN
---

# NoticeBar 公告栏

用于给用户显示提示消息，一般用于导航栏下方。

## 基础用法

:::demo

mobile/notice-bar/basic

:::

## NoticeBar 属性

| 属性名             | 类型    | 描述                                                                       | 默认值    |
| ------------------ | ------- | -------------------------------------------------------------------------- | --------- |
| speed              | Number  | 文字滚动速度，单位为 px/秒                                                 | 100       |
| text               | String  | 显示的文字内容                                                             | ''        |
| type               | String  | 通告栏类型，可选值：'default', 'success', 'warning', 'danger', 'customize' | 'default' |
| suffixIcon         | String  | 右侧图标类型，可选值：'default', 'close', 'more'                           | 'default' |
| showIcon           | Boolean | 是否显示左侧图标                                                           | true      |
| operationText      | String  | 设置操作按钮的文本内容                                                     | ''        |
| single             | Boolean | 是否单行展示，如果为 `true`，即使设置了滚动也只会单行显示                  | false     |
| scrollable         | Boolean | 是否滚动，添加后控制单行效果取消                                           | false     |
| backgroundColor    | String  | 自定义背景色（仅自定义类型生效）                                           | ''        |
| customizeIconColor | String  | 自定义图标色（仅自定义类型生效）                                           | ''        |

## NoticeBar 事件

| 事件称名  |            说明            | 返回值 |
| :-------: | :------------------------: | :----: |
|   click   | 点击 TemNoticeBar 触发事件 |   -    |
|   close   | 关闭 TemNoticeBar 触发事件 |   -    |
|  getMore  |   右侧更多 icon 点击事件   |   -    |
| operation |      操作按钮点击事件      |   -    |

## NoticeBar 插槽

| 名称 |         说明         |
| :--: | :------------------: |
| icon | 左侧 icon 自定义内容 |
