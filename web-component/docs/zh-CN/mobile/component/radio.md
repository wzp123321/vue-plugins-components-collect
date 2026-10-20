---
title: Radio 单选框
lang: zh-CN
---

# Radio 单选框

Radio 单选框组件，用于在预设的一组选项中执行单项选择，并呈现选择结果。

## 基础用法

:::demo 单项选择器，内部由多个 `<tem-radio>` 组成。通过把多个 radio 包裹在一个`tem-radio-group`下，实现这些`<tem-radio>`的单选。

mobile/radio/basic

:::

## Radio 属性

|  属性名  |  类型   | 默认值 |                                              说明                                              |
| :------: | :-----: | :----: | :--------------------------------------------------------------------------------------------: |
|  value   | String  |        | `<radio>` 标识。当该 `<radio>` 选中时，`<radio-group>` 的 change 事件会携带 `<radio>` 的 value |
| checked  | Boolean | false  |                                          当前是否选中                                          |
| disabled | Boolean | false  |                                            是否禁用                                            |

## RadioGroup 属性

|  属性名  |  类型   | 默认值 |      说明      |
| :------: | :-----: | :----: | :------------: |
| vertical | Boolean | false  | 是否为竖直排列 |

## RadioGroup 事件

| 事件名  |                         说明                         |                    返回值                    |
| :-----: | :--------------------------------------------------: | :------------------------------------------: |
| @change | `<radio-group>` 中的选中项发生变化时触发 change 事件 | `event.detail = {value: 选中项radio的value}` |
