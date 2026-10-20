---
title: Rate 评分
lang: zh-CN
---

# Rate 评分

用于评分

## 基础用法

:::demo 评分默认被分为三个等级，可以利用颜色数组对分数及情感倾向进行分级（默认情况下不区分颜色）。 三个等级所对应的颜色用 `colors` 属性设置，而它们对应的两个阈值则通过 `low-threshold` 和 `high-threshold` 设定。

rate/basic-usage

:::

## 尺寸

:::demo

rate/sizes

:::

## 允许半选

:::demo 属性 `allow-half` 允许出现半星

rate/allow-half

:::

## 辅助文字

用辅助文字直接地表达对应分数

:::demo 为组件设置 `show-text` 属性会在右侧显示辅助文字。 通过设置 `texts` 可以为每一个分值指定对应的辅助文字。 `texts` 为一个数组，长度应等于最大值 `max`。

rate/text

:::

## 可清空

:::demo 当你再次点击相同的值时，可以将值重置为 `0`。

rate/clearable

:::

## 更多种类的图标

当有多层评价时，可以用不同类型的图标区分评分层级。

:::demo 设置`icons`属性可以自定义不同分段的图标。 若传入数组，共有 3 个元素，为 3 个分段所对应的类名；若传入对象，可自定义分段，键名为分段的界限值，键值为对应的类名。 本例还使用 `void-icon` 指定了未选中时的图标类名。

rate/more-icons

:::

## 只读

只读的评分用来展示分数， 允许出现半星。

:::demo 为组件设置 `disabled` 属性表示组件为只读。 此时若设置 `show-score`，则会在右侧显示目前的分值。 此外，您可以使用属性 `score-template` 来提供评分模板。 模板为一个包含了 `{value}` 的字符串，`{value}` 会被替换为当前分值。

rate/readonly

:::

## 自定义样式

您可以为 rate 组件设定自定义样式。 使用 `css` 或 `scss` 改变全局或局部的颜色。 我们设置了一些全局颜色变量：`--te-rate-void-color`、`--te-rate-fill-color`、`--te-rate-disabled-void-color` 和 `--te-rate-text-color`。 您可以像这样使用：`:root { --te-rate-void-color: red; --te-rate-fill-color: blue; }`。

### 默认变量

| 变量                            | 默认颜色                          |
| ----------------------------- | ----------------------------- |
| --te-rate-void-color          | var(--te-border-color-darker) |
| --te-rate-fill-color          | #f7ba2a                       |
| --te-rate-disabled-void-color | var(--te-fill-color)          |
| --te-rate-text-color          | var(--te-text-color-primary)  |

## API

### Attributes

| 属性名                   | 说明                                                                      | 类型                                                                                 | 默认值                                                                |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| model-value / v-model | 选中项绑定值                                                                  | ^[number]                                                                          | 0                                                                  |
| max                   | 最大分值                                                                    | ^[number]                                                                          | 5                                                                  |
| size                  | 尺寸                                                                      | ^[enum]`'large' \| 'default' \| 'small'`                                         | —                                                                  |
| disabled              | 是否为只读                                                                   | ^[boolean]                                                                         | false                                                              |
| allow-half            | 是否允许半选                                                                  | ^[boolean]                                                                         | false                                                              |
| low-threshold         | 低分和中等分数的界限值， 值本身被划分在低分中                                                 | ^[number]                                                                          | 2                                                                  |
| high-threshold        | 高分和中等分数的界限值， 值本身被划分在高分中                                                 | ^[number]                                                                          | 4                                                                  |
| colors                | icon 的颜色。 若传入数组，共有 3 个元素，为 3 个分段所对应的颜色；若传入对象，可自定义分段，键名为分段的界限值，键值为对应的颜色  | ^[object]`string[] \| Record<number, string>`                               | ['#F7BA2A', '#F7BA2A', '#F7BA2A']                                  |
| void-color            | 未选中 icon 的颜色                                                            | ^[string]                                                                          | #C6D1DE                                                            |
| disabled-void-color   | 只读时未选中 icon 的颜色                                                         | ^[string]                                                                          | #EFF2F7                                                            |
| icons                 | 图标组件 若传入数组，则需要传入 3 个元素，分别为 3 个部分所对应的类名；若传入对象，则可自定义分段，键名为分段的界限值，键值为对应的类名 | ^[object]`string[] \| Component[] \| Record<number, string \| Component>` | [StarFilled, StarFilled, StarFilled]                               |
| void-icon             | 未被选中的图标组件                                                               | ^[string] / ^[Component]                                                           | Star                                                               |
| disabled-void-icon    | 禁用状态的未选择图标                                                              | ^[string] / ^[Component]                                                           | StarFilled                                                         |
| show-text             | 是否显示辅助文字，若为真，则会从 texts 数组中选取当前分数对应的文字内容                                 | ^[boolean]                                                                         | false                                                              |
| show-score            | 是否显示当前分数， show-score 和 show-text 不能同时为真                                 | ^[boolean]                                                                         | false                                                              |
| text-color            | 辅助文字的颜色                                                                 | ^[string]                                                                          | ''                                                                 |
| texts                 | 辅助文字数组                                                                  | ^[array]`string[]`                                                                 | ['Extremely bad', 'Disappointed', 'Fair', 'Satisfied', 'Surprise'] |
| score-template        | 分数显示模板                                                                  | ^[string]                                                                          | {value}                                                            |
| clearable ^(2.2.18)   | 是否可以重置值为 `0`                                                            | ^[boolean]                                                                         | false                                                              |
| id                    | 原生 `id` 属性                                                              | ^[string]                                                                          | —                                                                  |
| label ^(a11y)         | 和 Rate 的 `aria-label` 属性保持一致                                            | ^[string]                                                                          | —                                                                  |

### Events

| 事件名    | 描述说明    | 类型                                      |
| ------ | ------- | --------------------------------------- |
| change | 分值改变时触发 | ^[Function]`(value: number) => void` |

### Exposes

| 名称                | 描述    | 类型                                      |
| ----------------- | ----- | --------------------------------------- |
| setCurrentValue   | 设置当前值 | ^[Function]`(value: number) => void` |
| resetCurrentValue | 重置当前值 | ^[Function]`() => void`              |
