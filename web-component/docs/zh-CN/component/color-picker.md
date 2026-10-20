---
title: ColorPicker 颜色选择器
lang: zh-CN
---

# ColorPicker 颜色选择器

用于颜色选择，支持多种格式。

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (e.g: [VitePress](https://vitepress.vuejs.org/)).

:::

## 基础用法

:::demo 使用 v-model 与 Vue 实例中的一个变量进行双向绑定，绑定的变量需要是字符串类型。

color-picker/basic

:::

## 选择透明度

:::demo ColorPicker 支持普通颜色，也支持带 Alpha 通道的颜色，通过`show-alpha`属性即可控制是否支持透明度的选择。 要启用 Alpha 选择，只需添加 `show-alpha` 属性。

color-picker/alpha

:::

## 预定义颜色

:::demo ColorPicker 支持预定义颜色

color-picker/predefined-color

:::

## 不同尺寸

:::demo

color-picker/sizes

:::

## API

### Attributes

| 属性名                   | 说明                       | 类型                                                                                                                    | 默认值   |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----- |
| model-value / v-model | 选中项绑定值                   | ^[string]                                                                                                             | —     |
| disabled              | 是否禁用                     | ^[boolean]                                                                                                            | false |
| size                  | 尺寸                       | ^[enum]`'large' \| 'default' \| 'small'`                                                                            | —     |
| show-alpha            | 是否支持透明度选择                | ^[boolean]                                                                                                            | false |
| color-format          | 写入 v-model 的颜色的格式        | ^[enum]`'hsl' \| 'hsv' \| 'hex' \| 'rgb' \| 'hex' (when show-alpha is false) \| 'rgb' (when show-alpha is true)` | —     |
| popper-class          | ColorPicker 下拉框的类名       | ^[string]                                                                                                             | —     |
| predefine             | 预定义颜色                    | ^[object]`string[]`                                                                                                   | —     |
| validate-event        | 输入时是否触发表单的校验             | ^[boolean]                                                                                                            | true  |
| tabindex              | ColorPicker 的 tabindex   | ^[string] / ^[number]                                                                                                 | 0     |
| label ^(a11y)         | ColorPicker 的 aria-label | ^[string]                                                                                                             | —     |
| id                    | ColorPicker 的 id         | ^[string]                                                                                                             | —     |

### Events

| 事件名            | 说明                | 类型                                          |
| -------------- | ----------------- | ------------------------------------------- |
| change         | 当绑定值变化时触发         | ^[Function]`(value: string) => void`     |
| active-change  | 面板中当前显示的颜色发生改变时触发 | ^[Function]`(value: string) => void`     |
| focus ^(2.4.0) | 当获得焦点时触发          | ^[Function]`(event: FocusEvent) => void` |
| blur ^(2.4.0)  | 当失去焦点时触发          | ^[Function]`(event: FocusEvent) => void` |

### Exposes

| 名称              | 说明            | 类型                         |
| --------------- | ------------- | -------------------------- |
| color           | 当前色彩对象        | ^[object]`Color`           |
| show ^(2.3.3)   | 手动显示颜色选择器     | ^[Function]`() => void` |
| hide ^(2.3.3)   | 手动隐藏颜色选择器     | ^[Function]`() => void` |
| focus ^(2.3.13) | 使 picker 获得焦点 | ^[Function]`() => void` |
| blur ^(2.3.13)  | 使 picker 失去焦点 | ^[Function]`() => void` |
