---
title: TimeSelect 时间选择
lang: zh-CN
---

# TimeSelect 时间选择

用于选择或输入日期

可用时间范围是 00:00-23:59

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (例如: [VitePress](https://vitepress.vuejs.org/)).

:::

## 固定时间点

提供几个固定的时间点供用户选择

:::demo 使用 `te-time-select` 标签，然后通过`start`、`end`和`step`指定起始时间，结束时间和步长。

time-select/basic

:::

## 时间格式

使用 `format` 属性来控制时间格式 (小时以及分钟)。

在 [这里](https://day.js.org/docs/zh-CN/display/format) 查看 Day.js 支持的 format 参数。

:::warning

请一定要注意传入参数的大小写是否正确

:::

:::demo

time-select/time-formats

:::

## 固定时间范围

如果先选中了开始（或结束）时间，则结束（或开始）时间的状态也将会随之改变。

:::demo

time-select/time-range

:::

## API

### Attributes

| 属性名                   | 说明                                   | 类型                                                                                               | 默认值         |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------- |
| model-value / v-model | 选中项绑定值                               | ^[string]                                                                                        | —           |
| disabled              | 禁用状态                                 | ^[boolean]                                                                                       | false       |
| editable              | 文本框可输入                               | ^[boolean]                                                                                       | true        |
| clearable             | 是否显示清除按钮                             | ^[boolean]                                                                                       | true        |
| size                  | 输入框尺寸                                | ^[enum]`'large' \| 'default' \| 'small'`                                                       | default     |
| placeholder           | 非范围选择时的占位内容                          | ^[string]                                                                                        | —           |
| name                  | 原生属性                                 | ^[string]                                                                                        | —           |
| effect                | Tooltip 主题，内置了 `dark` / `light` 两种主题 | ^[string] / ^[enum]`'dark' \| 'light'`                                                          | light       |
| prefix-icon           | 自定义前缀图标                              | ^[string] / ^[Component]                                                                         | Clock       |
| clear-icon            | 自定义清除图标                              | ^[string] / ^[Component]                                                                         | CircleClose |
| start                 | 开始时间                                 | ^[string]                                                                                        | 09:00       |
| end                   | 结束时间                                 | ^[string]                                                                                        | 18:00       |
| step                  | 间隔时间                                 | ^[string]                                                                                        | 00:30       |
| min-time              | 最早时间点，早于该时间的时间段将被禁用                  | ^[string]                                                                                        | —           |
| max-time              | 最晚时间点，晚于该时间的时间段将被禁用                  | ^[string]                                                                                        | —           |
| format                | 设置时间格式                               | ^[string] see [formats](https://day.js.org/docs/en/display/format#list-of-all-available-formats) | HH:mm       |

### Events

| 事件名    | 说明                | 类型                                          |
| ------ | ----------------- | ------------------------------------------- |
| change | 用户确认选定的值时触发       | ^[Function]`(value: string) => void`     |
| blur   | 在组件 Input 失去焦点时触发 | ^[Function]`(event: FocusEvent) => void` |
| focus  | 在组件 Input 获得焦点时触发 | ^[Function]`(event: FocusEvent) => void` |

### Exposes

| 方法名   | 说明           | 类型                         |
| ----- | ------------ | -------------------------- |
| focus | 使 input 获取焦点 | ^[Function]`() => void` |
| blur  | 使 input 失去焦点 | ^[Function]`() => void` |
