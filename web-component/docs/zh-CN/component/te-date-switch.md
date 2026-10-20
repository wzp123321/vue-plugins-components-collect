---
title: DateSwitch 日期选择器
lang: zh-CN
---

具有快捷切换功能的日期选择器。

## 基础用法

:::demo

te-date-switch/basic

:::

## 自定义事件
可以自行定义方法覆盖内部的行为，如超过某日期后调用弹窗。
:::demo

te-date-switch/controlled-mode

:::

## API

### 属性（props）

| 属性名 | 说明 | 类型 | 是否必要 | 默认值 |
| ----------- | ------------------ | ------ | -------- | ------ |
| v-model | 绑定值 | string | 是 | "" |
| type | 日期类型 | year \| month \| date | 是 | year |
| format | 格式化(可参照dayjs) | string | 是 | YYYY |
| forwardLimit | 是否限制不允许超过当前日期 | boolean | 否 | true |
| handleForward| 自定义向前切换方法 | ^[Function]`(date: string) => void` | 否 | false |
| handleBackward| 自定义向后切换方法 | ^[Function]`(date: string) => void` | 否 | false |
| handleDateChange | 自定义日期切换方法 | ^[Function]`(date: string) => void` | 否 | false |

其余参数同：[DatePicker Attributes](/zh-CN/component/date-picker.md#属性)

### 事件（events）
| 事件名 | 说明                 | 接受参数 |
| ------ | -------------------- | -------- |
| forward  | 点击向前切换按钮事件 | currentDate:string |
| backward  | 点击向后切换按钮事件 | currentDate:string |
| dateChange  | 日期变化触发事件 | currentDate:string |

其余事件同：[DatePicker Events](/zh-CN/component/date-picker.md#事件)
