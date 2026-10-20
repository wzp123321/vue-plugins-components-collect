---
title: Tag 标签
lang: zh-CN
---

# Tag 标签

用于表明主体的类目，属性或状态。

## 基础用法

:::demo

mobile/tag/basic

:::

## Tag 属性

|  属性名  |                       类型                        |  默认值   |                                              说明                                               |
| :------: | :-----------------------------------------------: | :-------: | :---------------------------------------------------------------------------------------------: |
|   text   |                      String                       |     -     |                                            标签内容                                             |
|   size   |                      String                       |  default  |                             大小尺寸，可选值：default、small、mini                              |
|   type   |                      String                       |  default  | 颜色类型，可选值：default（灰色）、primary（蓝色）、success（绿色）、warning(黄色)、error(红色) |
| disabled |                      Boolean                      |   false   |                                         是否为禁用状态                                          |
| inverted |                      Boolean                      |   false   |                                  是否无需背景颜色（空心标签）                                   |
|  circle  |                      Boolean                      |   false   |                                           是否为圆角                                            |
|  light   |                      Boolean                      |   false   |                                         是否为浅色状态                                          |
|  shape   | ^[enum]`default(矩形)\|capsule(胶囊)\|mark(标记)` | 'default' |                                              形状                                               |
| closable |                      Boolean                      |   false   |                                           是否可关闭                                            |

## Tag 事件

| 事件名 |       说明        |    返回值    |
| :----: | :---------------: | :----------: |
| @click | 点击 Tag 触发事件 | `() => void` |
| @close | 点击关闭 触发事件 | `() => void` |

## Tag 插槽

|  名称   |      说明      |
| :-----: | :------------: |
| default | 标题前面的内容 |
