---
title: List 描述列表
lang: zh-CN
---

# List 描述列表

用于展示多个字段。

## 基础用法

:::demo

mobile/list/basic

:::

## List 属性

| 属性名 |  类型   | 默认值 |     说明     |
| :----: | :-----: | :----: | :----------: |
| border | Boolean |  true  | 是否显示边框 |

## ListItem 属性

|    属性名     |           类型           |   默认值   |                                                              说明                                                              |
| :-----------: | :----------------------: | :--------: | :----------------------------------------------------------------------------------------------------------------------------: |
|     title     |          String          |     -      |                                                              标题                                                              |
|     note      |          String          |     -      |                                                              描述                                                              |
| notePosition  | ^[enum]`bottom \| right` |  'bottom'  |                                                            描述位置                                                            |
|   ellipsis    |          Number          |     0      |                          title 是否溢出隐藏，可选值，0:默认; 1:显示一行; 2:显示两行;【nvue 暂不支持】                          |
|     thumb     |          String          |     -      |                                         左侧缩略图，若 thumb 有值，则不会显示扩展图标                                          |
|   thumbSize   |          String          |   medium   |                                       略缩图尺寸，可选值，lg:大图; medium:一般; sm:小图;                                       |
|   showBadge   |         Boolean          |   false    |                                                        是否显示数字角标                                                        |
|   badgeText   |          String          |     -      |                                                          数字角标内容                                                          |
|   badgeType   |          String          |     -      |                             数字角标类型，参考[uni-icons](https://ext.dcloud.net.cn/plugin?id=21)                              |
|   rightText   |          String          |     -      |                                                          右侧文字内容                                                          |
|   disabled    |         Boolean          |   false    |                                                            是否禁用                                                            |
|   showArrow   |         Boolean          |    true    |                                                        是否显示箭头图标                                                        |
|     link      |          String          | navigateTo |                                                  新页面跳转方式，可选值见下表                                                  |
|      to       |          String          |     -      |                                   新页面跳转地址，如填写此属性，click 会返回页面是否跳转成功                                   |
|   clickable   |         Boolean          |   false    |                                                        是否开启点击反馈                                                        |
|  showSwitch   |         Boolean          |   false    |                                                        是否显示 Switch                                                         |
| switchChecked |         Boolean          |   false    |                                                       Switch 是否被选中                                                        |
| showExtraIcon |         Boolean          |   false    |                                                      左侧是否显示扩展图标                                                      |
|   extraIcon   |          Object          |     -      | 扩展图标参数，格式为 `{color: '#4cd964',size: '22',type: 'spinner'}`，参考 [uni-icons](https://ext.dcloud.net.cn/plugin?id=28) |
|   direction   |          String          |    row     |                  排版方向，可选值，row:水平排列; column:垂直排列; 3 个插槽是水平排还是垂直排，也受此属性控制                   |

## ListItem 事件

|    事件名     |                 说明                  |       返回值        |
| :-----------: | :-----------------------------------: | :-----------------: |
|    @click     |        点击 listItem 触发事件         |    `() => void`     |
| @switchChange | 点击切换 Switch 时触发，需显示 switch | `e={value:checked}` |

## ListItem 插槽

|  名称  |                说明                 |
| :----: | :---------------------------------: |
| header | 左/上内容插槽，可完全自定义默认显示 |
|  body  | 中间内容插槽，可完全自定义中间内容  |
| footer | 右/下内容插槽，可完全自定义右侧内容 |

::: tip 通过插槽扩展
需要注意的是当使用插槽时，内置样式将会失效，只保留排版样式，此时的样式需要开发者自己实现

- 当 `direction` 属性为 `row` 时表示水平排列，此时 `header` 表示列表的左边部分，`body` 表示列表的中间部分，`footer` 表示列表的右边部分
- 当 `direction` 属性为 `column` 时表示垂直排列，此时 `header` 表示列表的上边部分，`body` 表示列表的中间部分，`footer` 表示列表的下边部分

开发者可以只用 1 个插槽，也可以 3 个一起使用。在插槽中可自主编写 view 标签，实现自己所需的效果。
:::
