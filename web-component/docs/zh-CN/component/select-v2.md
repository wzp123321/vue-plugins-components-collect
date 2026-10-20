---
title: Virtualized Select 虚拟化选择器
lang: zh-CN
---

# Select V2 虚拟列表选择器 ^(beta)

:::tip

这个组件目前在测试当中，如果在使用中发现任何漏洞和问题，请在 [GitHub](https://github.com/element-plus/element-plus/issues) 中提交 issue 以便我们进行处理。

:::

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (例如: [VitePress](https://vitepress.vuejs.org/)).

:::

## 背景

在某些使用情况下，单个选择器可能最终加载数万行数据。 将这么多的数据渲染至 DOM 中可能会给浏览器带来负担，从而造成性能问题。 为了更好的用户和开发者体验，我们决定添加此组件。

## 基础用法

适用广泛的基础选择器

:::demo

select-v2/basic-usage

:::

## 多选

最基础的多选选择器

:::demo

select-v2/multiple

:::

## 隐藏多余标签的多选

默认情况下选中值会以 Tag 的形式展现，你也可以设置`collapse-tags`属性将它们合并为一段文字。 您可以使用 `collapse-tags-tooltip` 属性来启用鼠标悬停折叠文字以显示具体所选值的行为。

:::demo

select-v2/hide-extra-tags

:::

## 可过滤的多选

当选项太多时，你可以使用 `filterable` 选项来启用过滤功能来找到所需的选项。

:::demo

select-v2/filterable

:::

## 禁用选择器本身或选项

您可以选择禁用 Select 或者 Select 中的某个选项。

:::demo

select-v2/disabled

:::

## 给选项进行分组

只要数据格式满足特定要求，我们就可以按照自己的意愿为选项进行分组。

:::demo

select-v2/grouping

:::

## 自定义选项的渲染模板

我们也可以通过自定义模板来渲染自己想要的选项内容。

:::demo

select-v2/customized-option

:::

## 一键清除

我们可以同时清除所有选定的选项。此设定也适用于单选。

:::demo

select-v2/clearable

:::

## 创建临时选项

创建并选中未包含在初始选项中的条目。

通过使用 `allow-create` 属性，用户可以通过输入框创建新项目。 为了使 `allow-create` 正常工作， `filterable` 的值必须为 `true`。

:::tip

最好在使用 `allow-create` 属性的同时设置 `:reserve-keyword="false"`。

:::

:::demo

select-v2/allow-create

:::

## 远程搜索

输入关键字以从远程服务器中查找数据。

:::demo 从服务器搜索数据，输入关键字进行查找。为了启用远程搜索，需要将`filterable`和`remote`设置为`true`，同时传入一个`remote-method`。 `remote-method`为一个`Function`，它会在输入值发生变化时调用，参数为当前输入值。

select-v2/remote-search

:::

## 使用 value-key 键属性

当 `options.value` 是一个对象时，您应该为它设置一个唯一的标识名称

::: tip

在 ^(2.4.0) 之前，`value-key`既用作所选对象的唯一值，也用作`options`中表示值的对应 key。 现在 `value-key` 仅作为所选对象的唯一值使用，选项中值的 key 是 `props.value`.

:::

:::demo

select-v2/use-valueKey

:::

<!-- ## 自定义选项 ^(2.4.2)

当您的 `options` 格式不同于默认格式 您可以通过 `props` 属性自定义 `options`

:::demo

select-v2/props

::: -->

## SelectV2 属性

| 属性名                                 | 说明                                                              | 类型                                 | 可选值                                                                                                       | 默认值           |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------- |
| model-value / v-model               | 绑定值                                                             | string / number / boolean / object | —                                                                                                         | —             |
| options                             | 选项的数据源， `value` 的 key 和 `label`.                | Array                              | —                                                                                                         | —             |
| multiple                            | 是否多选                                                            | boolean                            | —                                                                                                         | false         |
| disabled                            | 是否禁用                                                            | boolean                            | —                                                                                                         | false         |
| value-key                           | 作为 value 唯一标识的键名，绑定值为对象类型时必填                                    | string                             | —                                                                                                         | value         |
| size                                | 输入框尺寸                                                           | string                             | large/default/small                                                                                       | default       |
| clearable                           | 是否可以清空选项                                                        | boolean                            | —                                                                                                         | false         |
| clear-icon                          | 自定义清除图标                                                         | `string \| Component`             | —                                                                                                         | CircleClose   |
| collapse-tags                       | 多选时是否将选中值按文字的形式展示                                               | boolean                            | —                                                                                                         | false         |
| multiple-limit                      | 多选时可被选择的最大数目。 当被设置为0时，可被选择的数目不设限。                               | number                             | —                                                                                                         | 0             |
| name                                | 选择器的原生name属性                                                    | string                             | —                                                                                                         | —             |
| effect                              | 文字提示（Tooltip）的主题，内置`dark`和`light`两种。                            | string                             | string                                                                                                    | light         |
| autocomplete                        | 自动完成选择输入                                                        | string                             | —                                                                                                         | off           |
| placeholder                         | placeholder                                                     | string                             | —                                                                                                         | Please select |
| filterable                          | 是否可筛选                                                           | boolean                            | —                                                                                                         | false         |
| allow-create                        | 是否允许创建新条目， 当使用该属性时，`filterable`必须设置为`true`                      | boolean                            | —                                                                                                         | false         |
| reserve-keyword                     | 筛选时，是否在选择选项后保留关键字                                               | boolean                            | —                                                                                                         | true          |
| no-data-text                        | 当在没有数据时显示的文字，你同时可以使用empty插槽进行设置。                                | string                             | —                                                                                                         | No Data       |
| popper-class                        | 选择器下拉菜单的自定义类名                                                   | string                             | —                                                                                                         | —             |
| popper-append-to-body ^(deprecated) | 是否将弹出框插入至 body 元素 当弹出框的位置出现问题时，你可以尝试将该属性设置为false。               | boolean                            | -                                                                                                         | false         |
| teleported                          | 是否将下拉列表元素插入 append-to 指向的元素下                                    | boolean                            | true / false                                                                                              | true          |
| persistent                          | 当下拉选择器未被激活并且`persistent`设置为`false`，选择器会被删除。                     | boolean                            | true / false                                                                                              | true          |
| popper-options                      | 自定义 popper 选项，更多请参考 [popper.js](https://popper.js.org/docs/v2/) | object                             | -                                                                                                         | -             |
| automatic-dropdown                  | 对于不可搜索的 Select，是否在输入框获得焦点后自动弹出选项菜单                              | boolean                            | -                                                                                                         | false         |
| height                              | 下拉菜单的高度，每一个选项为34px                                              | number                             | -                                                                                                         | 170           |
| item-height                         | 下拉项的高度                                                          | number                             | -                                                                                                         | 34            |
| scrollbar-always-on                 | 是否总是展示滚动条                                                       | boolean                            | -                                                                                                         | false         |
| remote                              | 是否从服务器获取数据                                                      | boolean                            | —                                                                                                         | false         |
| remote-method                       | 当输入值发生变化时触发的函数。 它的参数就是当前的输入值。 当`filterable`设置为 true 时才会生效       | function(keyword: string)          | —                                                                                                         | —             |
| validate-event                      | 是否触发表单验证                                                        | boolean                            | -                                                                                                         | true          |
| placement                           | 下拉框出现的位置                                                        | string                             | top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end | bottom-start  |
| collapse-tags-tooltip ^(2.3.0)      | 当鼠标悬停于折叠标签的文本时，是否显示所有选中的标签。 只有当 `collapse-tags` 设置为 true 时才会生效。 | boolean                            | true / false                                                                                              | false         |
| max-collapse-tags ^(2.3.0)          | 需要显示的 Tag 的最大数量 只有当 `collapse-tags` 设置为 true 时才会生效。             | number                             | —                                                                                                         | 1             |

<span style="display: none;">
<!-- | default-first-option | 在输入框按下回车，选择第一个匹配项。需配合 `filterable` 或 `remote` 使用 | boolean | - | false |
| filter-method | 自定义搜索方法 | function | — | — |
| loading | 是否正在从远程获取数据 | boolean | — | false |
| loading-text | 远程加载时显示的文字 | string | — | 加载中 | -->
</span>

## props

| Attribute | 说明                  | Type   | Default  |
| --------- | ------------------- | ------ | -------- |
| value     | 指定选项的值为选项对象的某个属性值   | string | value    |
| label     | 指定节点标签为节点对象的某个属性值   | string | label    |
| options   | 指定选项的子选项为选项对象的某个属性值 | string | options  |
| disabled  | 指定选项的禁用为选项对象的某个属性值  | string | disabled |

## SelectV2 事件

| 插槽名            | 说明                   | 参数                  |
| -------------- | -------------------- | ------------------- |
| change         | 选中值发生变化时触发           | val，目前的选中值          |
| visible-change | 下拉框出现/隐藏时触发          | 出现时为true，隐藏时为false  |
| remove-tag     | 多选模式下移除tag时触发        | val，移除的tag值         |
| clear          | 可清空的单选模式下用户点击清空按钮时触发 | —                   |
| blur           | 当选择器的输入框失去焦点时触发      | (event: FocusEvent) |
| focus          | 当选择器的输入框获得焦点时触发      | (event: FocusEvent) |

## SelectV2 插槽

| 名称      | 详情            |
| ------- | ------------- |
| default | 自定义 Option 模板 |
| empty   | 自定义当选项为空时的内容  |
| prefix  | 输入框的前缀        |
