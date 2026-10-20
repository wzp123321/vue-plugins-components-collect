---
title: DatePicker 日期选择器
lang: zh-CN
---

# DatePicker 日期选择器

用于选择或输入日期

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (e.g: [VitePress](https://vitepress.vuejs.org/)).

:::

## 选择某一天

以”日“为基本单位，基础的日期选择控件

:::demo 基本单位由 `type` 属性指定。 通过 `shortcuts` 配置快捷选项， 通过 `disabledDate` 函数，来设置禁用掉的日期。

date-picker/enter-date

:::

## 其他日期单位

通过扩展基础的日期选择，可以选择周、月、年或多个日期

:::demo

date-picker/other-measurements

:::

## 选择一段时间

你可以通过如下例子来学习如何设置一个日期范围选择器。

:::demo 在选择日期范围时，默认情况下左右面板会联动。 如果希望两个面板各自独立切换当前月份，可以使用 `unlink-panels` 属性解除联动。

date-picker/date-range

:::

## 选择月份范围

你当然还可以选择一个月的范围。

:::demo 在选择月份范围时，默认情况下左右面板会联动。 如果希望两个面板各自独立切换当前年份，可以使用 `unlink-panels` 属性解除联动。

date-picker/month-range

:::

## 默认值

日期选择器会在用户未选择任何日期的时候默认展示当天的日期。 你也可以使用 `default-value` 来修改这个默认的日期。 请注意该值需要是一个可以解析的 `new Date()` 对象。

如果类型是 `daterange`, `default-value` 则会设置左边窗口的默认值。

:::demo

date-picker/default-value

:::

## 日期格式

使用`format`指定输入框的格式。 使用 `value-format` 指定绑定值的格式。

默认情况下，组件接受并返回`Date`对象。

在 [这里](https://day.js.org/docs/en/display/format#list-of-all-available-formats) 查看 Day.js 支持的所有格式。

:::warning

请一定要注意传入参数的大小写是否正确

:::

:::demo

date-picker/date-formats

:::

## 默认显示日期

在选择日期范围时，你可以指定起始日期和结束日期的默认时间。

:::demo 默认情况下，开始日期和结束日期的时间部分都是选择日期当日的 `00:00:00`。 通过 `default-time` 可以分别指定开始日期和结束日期的具体时刻。 它接受最多两个日期对象的数组。 其中第一项控制起始日期的具体时刻，第二项控制结束日期的具体时刻。

date-picker/default-time

:::

## 设置自定义前缀的内容

前缀内容可以被自定义。

:::demo 当你从其他vue组件或由渲染函数生成的组件中导入组件时, 你可以设置 `prefix-icon` 属性来定制前缀内容

date-picker/custom-prefix-icon

:::

## 自定义内容

弹出框的内容是可以自定义的，在插槽内你可以获取到当前单元格的数据

:::demo

date-picker/custom-content

:::

更详细的数据类型，请查看下表

```ts
interface DateCell {
  column: number
  customClass: string
  disabled: boolean
  end: boolean
  inRange: boolean
  row: number
  selected: Dayjs
  isCurrent: boolean
  isSelected: boolean
  start: boolean
  text: number
  timestamp: number
  date: Date
  dayjs: Dayjs
  type: 'normal' | 'today' | 'week' | 'next-month' | 'prev-month'
}
```

## 国际化

由于 Element Plus 的默认语言为英语，如果你需要设置其它的语言，请参考[国际化](/zh-CN/guide/i18n)文档。

要注意的是：日期相关的文字（月份，每一周的第一天等等）也都是通过国际化来配置的。

## API

### 属性

| 属性名                   | 说明                                                              | 类型                                                                                                                                | 默认            |
| --------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| model-value / v-model | 绑定值，如果它是数组，长度应该是 2                                              | ^[number] / ^[string] / ^[object]`Date \| [Date, Date] \| [string, string]`                                                     | ''            |
| readonly              | 只读                                                              | ^[boolean]                                                                                                                        | false         |
| disabled              | 禁用                                                              | ^[boolean]                                                                                                                        | false         |
| size                  | 输入框尺寸                                                           | ^[enum]`'' \| 'large' \| 'default' \| 'small'`                                                                                 | —             |
| editable              | 文本框可输入                                                          | ^[boolean]                                                                                                                        | true          |
| clearable             | 是否显示清除按钮                                                        | ^[boolean]                                                                                                                        | true          |
| placeholder           | 非范围选择时的占位内容                                                     | ^[string]                                                                                                                         | ''            |
| start-placeholder     | 范围选择时开始日期的占位内容                                                  | ^[string]                                                                                                                         | —             |
| end-placeholder       | 范围选择时结束日期的占位内容                                                  | ^[string]                                                                                                                         | —             |
| type                  | 显示类型                                                            | ^[enum]`'year' \| 'month' \| 'date' \| 'dates' \| 'datetime' \| 'week' \| 'datetimerange' \| 'daterange' \| 'monthrange'` | date          |
| format                | 显示在输入框中的格式                                                      | 参见 [date formats](/zh-CN/component/date-picker#date-formats)                                                                      | YYYY-MM-DD    |
| popper-class          | DatePicker 下拉框的类名                                               | ^[string]                                                                                                                         | —             |
| popper-options        | 自定义 popper 选项，更多请参考 [popper.js](https://popper.js.org/docs/v2/) | ^[object]`Partial<PopperOptions>`                                                                                           | {}            |
| range-separator       | 选择范围时的分隔符                                                       | ^[string]                                                                                                                         | '-'           |
| default-value         | 可选，选择器打开时默认显示的时间                                                | ^[object]`Date \| [Date, Date]`                                                                                                  | —             |
| default-time          | 范围选择时选中日期所使用的当日内具体时刻                                            | ^[object]`Date \| [Date, Date]`                                                                                                  | —             |
| value-format          | 可选，绑定值的格式。 不指定则绑定值为 Date 对象                                     | 参见 [date formats](/zh-CN/component/date-picker#date-formats)                                                                      | —             |
| id                    | 等价于原生 input `id` 属性                                             | ^[string] / ^[object]`[string, string]`                                                                                           | —             |
| name                  | 等价于原生 input `name` 属性                                           | ^[string] / ^[object]`[string, string]`                                                                                           | ''            |
| unlink-panels         | 在范围选择器里取消两个日期面板之间的联动                                            | ^[boolean]                                                                                                                        | false         |
| prefix-icon           | 自定义前缀图标 如果 `type`的值是`TimeLikeType`，那么就是 `Clock`，不然就是 `Calendar` | ^[string] / ^[object]`Component`                                                                                                  | ''            |
| clear-icon            | 自定义清除图标                                                         | ^[string] / ^[object]`Component`                                                                                                  | `CircleClose` |
| validate-event        | 是否触发表单验证                                                        | ^[boolean]                                                                                                                        | true          |
| disabled-date         | 一个用来判断该日期是否被禁用的函数，接受一个 Date 对象作为参数。 应该返回一个 Boolean 值。           | ^[Function]`(data: Date) => boolean`                                                                                           | —             |
| shortcuts             | 设置快捷选项，需要传入数组对象                                                 | ^[object]`Array<{ text: string, value: Date \| Function }>`                                                                | []            |
| cell-class-name       | 设置自定义类名                                                         | ^[Function]`(data: Date) => string`                                                                                            | —             |
| teleported            | 是否将 date-picker 的下拉列表插入至 body 元素                                | ^[boolean]                                                                                                                        | true          |

### 事件

| 事件名             | 说明                         | 类型                                                                                             |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| change          | 用户确认选定的值时触发                | ^[Function]`(val: typeof v-model) => void`                                                  |
| blur            | 在组件 Input 失去焦点时触发          | ^[Function]`(e: FocusEvent) => void`                                                        |
| focus           | 在组件 Input 获得焦点时触发          | ^[Function]`(e: FocusEvent) => void`                                                        |
| calendar-change | 在日历所选日期更改时触发               | ^[Function]`(val: [Date, null \| Date]) => void`                                           |
| pante-change    | 当日期面板改变时触发。                | ^[Function]`(date: Date \| [Date, Date], mode: 'month' \| 'year', view?: string) => void` |
| visible-change  | 当 DatePicker 的下拉列表出现/消失时触发 | ^[Function]`(visibility: boolean) => void`                                                  |

### 插槽

| 名称              | 说明         |
| --------------- | ---------- |
| default         | 自定义单元格内容   |
| range-separator | 自定义范围分割符内容 |

### 暴露

| 插槽名                   | 说明           | 类型                                                                                |
| --------------------- | ------------ | --------------------------------------------------------------------------------- |
| focus                 | 使选择器的输入框获取焦点 | ^[Function]`(focusStartInput?: boolean, isIgnoreFocusEvent?: boolean) => void` |
| handleOpen ^(2.2.16)  | 打开日期选择器弹窗    | ^[Function]`() => void`                                                        |
| handleClose ^(2.2.16) | 关闭日期选择器弹窗    | ^[Function]`() => void`                                                        |

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
import type { Options as PopperOptions } from '@popperjs/core'

type TimeLikeType = 'datetime' | 'datetimerange'
```

</details>
