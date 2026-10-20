---
title: Virtualized Table 虚拟化表格
lang: zh-CN
---

# Virtualized Table 虚拟化表格 ^(beta)

在前端开发领域，表格一直都是一个高频出现的组件，尤其是在中后台和数据分析场景。 但是，对于 [Table V1](./table.md)来说，当一屏里超过 1000 条数据记录时，就会出现卡顿等性能问题，体验不是很好。

通过虚拟化表格组件，超大数据渲染将不再是一个头疼的问题。

:::tip

该组件**仍在测试中**，生产环境使用可能有风险。 若您发现了 bug 或问题，请于 [GitHub](https://github.com/element-plus/element-plus/issues) 报告给我们以便修复。 同时，有一些 API 并未在此文档中提及，因为部分还没有开发完全，因此我们不在此提及。

**即使**虚拟化的表格是高效的，但是当数据负载过大时，**网络**和**内存容量**也会成为您应用程序的瓶颈。 因此请牢记，虚拟化表格永远不是最完美的解决方案，请考虑数据分页、过滤器等优化方案。

:::

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (例如: [VitePress](https://vitepress.vuejs.org/)).

:::

## 基础用法

让我们演示虚拟化表的性能，用10列和1 000行渲染一个基本示例。

:::demo

table-v2/basic

:::

## 自动调整大小

如果不想手动向表格传递 `width` 和 `height` 属性，可以使用 AutoResizer 对表格组件进行封装。 这会自动为你更新宽度和高度。

尝试调整您的浏览器大小来看看它是如何工作的。

:::tip

由于 `AutoResizer` 组件的默认高度是 100%，所以请确保该组件的父元素**拥有固定的高度值**。 或者，您可以通过将 `style` 属性传递到 `AutoResizer` 来定义它。

:::

:::demo

table-v2/auto-resizer

:::

## 自定义单元格渲染器{#customize-cell-renderer}

当然，您可以根据您的需要呈现表格单元格。 这是如何自定义您的单元格的简单例子。

:::demo

table-v2/cell-templating

:::

## 带有选择的表格

使用自定义的单元格渲染来给表格组件添加选择的能力。

:::demo

table-v2/selection

:::

## 可编辑单元格

类似上面添加筛选框的方法，我们可以用同样的方法实现可编辑单元格。

:::demo

table-v2/inline-editing

:::

## 带状态的表格

可将表格内容 highlight 显示，方便区分「成功、信息、警告、危险」等内容。

要自定义行的外观，请使用 `row-class-name` 属性。 举个例子，每10行会自动添加 `bg-blue-200` 类名，每5行会添加 `bg-red-100` 类名。

:::demo

table-v2/row-class

:::

## 表格行的粘性布局

您可以简单地使用 `fixed-data` 属性来实现将某些行固定到表格的头部。

您可以根据滚动事件动态设置粘性行，如这个示例所示。

:::demo

table-v2/sticky-rows

:::

## 固定列表格

如果您想要有列粘贴左侧或右侧的某种原因。 您可以通过向表中添加特殊属性来实现这一点。

您可以设置该行的` fixed` 属性为 `true` （代表`FixedDir.LEFT`）、`FixedDir.LEFT` 或 `FixedDir.RIGHT`

:::demo

table-v2/fixed-columns

:::

## 表头分组

正如这个示例，通过自定义表头渲染以将表头分组。

:::tip

在这种情况下，我们使用了 `JSX` 功能，这个功能在playground上不被支持。 您可以在本地环境或在线集成开发环境（如 `codesandbox` ）中试用它们。

建议您使用 JSX 使用您的表格组件，因为它包含 VNode 操作。

:::

:::demo

table-v2/grouping-header

:::

## 过滤器

虚拟表格提供自定义页眉渲染器以创建自定义标题。 然后我们可以利用这些来渲染过滤器。

:::demo

table-v2/filter

:::

## 可排序表格

您可以使用排序状态来对表格进行排序。

:::demo

table-v2/sort

:::

## 受控的排序

您可以在需要时定义多个可排序的列。 请记住，当您在定义了多个可排序的列时， UI 可能会显得有些奇怪，因为用户不知道哪一列被排序。

:::demo

table-v2/controlled-sort

:::

## 高亮显示鼠标悬停单元格

当处理一个大的列表时，很容易丢失当前行的轨迹和您正在访问的一列。 在这种情况下，使用这个功能可能很有帮助。

:::demo

table-v2/cross-hovering

:::

## 横跨列

虚拟化表格没有使用内置的 `table` 元素，故 `colspan` 和 `rowspan` 与 [TableV1](./table.md) 比较略有不同。 然而，通过定制的行渲染器，这些功能仍然可以实现。 在本节中，我们将演示如何实现这一点。

:::demo

table-v2/colspan

:::

## 纵跨行

既然我们已经覆盖了 [Colspan](#colspan)，那我们也可以覆盖Row也是没问题的。 它与colspan略有不同，但是 的想法基本上是一样的。

:::demo

table-v2/rowspan

:::

## 同时跨行和跨列

我们当然可以同时使用横跨列与纵跨行来满足您的业务需求！

:::demo

table-v2/spans

:::

## 树形数据

虚拟表也可以在树状结构中呈现数据。 点击箭头图标，你可以展开或折叠树节点。

:::demo

table-v2/tree-data

:::

## 动态高度行

虚拟表能够呈现具有动态高度的行数。 如果您正在处理数据并不确定内容大小， 此功能对于调整到内容高度的渲染行是理想的。 要启用此功能，请传递 `estimated-row-height` 属性。 估计高度越接近实际内容，渲染体验就越顺。

:::tip

每行高度在渲染过程中动态测量。 因此，如果您试图显示大量数据， UI **可能会** 抖动。

:::

:::demo

table-v2/dynamic-height

:::

## 可展开的附加信息

使用动态高度渲染，您也可以在表格中显示详细的视图。

:::demo

table-v2/detailed-view

:::

## 自定义页脚

自定义表格 footer， 通常用来展示一些汇总数据和信息。

:::demo

table-v2/footer

:::

## 自定义空元素渲染器

渲染自定义的空元素

:::demo

table-v2/empty

:::

## 浮动遮罩层

当您想要显示加载指示器之类的浮动元素，可以通过渲染一个浮动在表格之上的遮罩层来实现。

:::demo

table-v2/overlay

:::

## 手动滚动

使用 Table V2 暴露的方法可以进行手动或编程式的滚动到指定的偏移量或者行。

:::tip

`scrollToRow` 的第二个参数代表滚动策略，计算了要滚动的位置，其默认值是 `auto`。 如果你想要滚动到某个特定位置，你可以自己定义战略。 可用的选项是 `"auto" | "center" | "end" | "start" | "smart"`

`smart` 和`auto` 之间的区别是， `auto` 是 `smart` 滚动策略的子集。

:::

:::demo

table-v2/manual-scroll

:::

## TableV2 属性

| 属性名                       | 描述说明                                                | 类型                                                     | 默认值       |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------------ | --------- |
| cache                     | 为了更好的渲染效果预先多加载的行数                                   | Number                                                 | 2         |
| estimated-row-height      | 渲染动态的单元格的预估高度                                       | Number                                                 | -         |
| header-class              | header 部分的自定义 class 名                               | String/Function\<[HeaderClassGetter](#typings)\>     | -         |
| header-props              | header 部分的自定义 props 名                               | Object/Function\<[HeaderPropsGetter](#typings)\>     | -         |
| header-cell-props         | header cell 部分的自定义 props 名                          | Object/Function\<[HeaderCellPropsGetter](#typings)\> | -         |
| header-height             | Header 的高度由`height`设置。 如果传入数组，它会使 header row 等于数组长度 | Number/Array\<Number\>                               | 50        |
| footer-height             | Footer 部分的高度，当传入值时，这部分将被计算入 table 的高度里              | Number                                                 | 0         |
| row-class                 | row wrapper 部分的自定义 class 名                          | String/Function\<[RowClassGetter](#typings)\>        | -         |
| row-key                   | 每行的 key 值，如果不提供，将使用索引 index 代替                      | String/Symbol/Number                                   | id        |
| row-props                 | row component 部分的自定义 class 名                        | Object/Function\<[RowPropsGetter](#typings)\>        | -         |
| row-height                | 每行的高度, 用于计算表的总高度                                    | Number                                                 | 50        |
| cell-props                | 每个单元格 cell 的自定义 props (除了 header cell 以外)           | Object/Function\<[CellPropsGetter](#typings)\>       | -         |
| columns                   | 列 column 的配置数组                                      | Array\<[Column](#column-attribute)\>                 | -         |
| data                      | 要在表中渲染的数据数组                                         | Array\<[Data](#typings)\>                            | []        |
| data-getter               | 一个自定义方法从数据源获取数据                                     | Function                                               | -         |
| fixed-data                | 渲染行在表格主内容上方和 header 下方区域的数据                         | Array\<[Data](#typings)\>                            | -         |
| expand-column-key         | 列的 key 来标记哪个行可以被展开                                  | String                                                 | -         |
| expanded-row-keys         | 存放行展开状态的 key 的数组，可以和  `v-model` 搭配使用                | Array\<[KeyType](#typings)\>                         | -         |
| default-expanded-row-keys | 默认展开的行的 key 的数组, **这个数据不是响应式的**                     | Array\<[KeyType](#typings)\>                         | -         |
| class                     | 表格的类名称，将应用于表格的全部的三个部分 (左、右、主)                       | String/Array/Object                                    | -         |
| fixed                     | 单元格宽度是自适应还是固定                                       | Boolean                                                | false     |
| width ^(required)         | 表格的宽度                                               | Number                                                 | -         |
| height ^(required)        | 表格的高度                                               | Number                                                 | -         |
| max-height                | 表格的最大高度                                             | Number                                                 | -         |
| h-scrollbar-size          | 配置表格的水平滚动条大小，防止水平和垂直滚动条重叠。                          | Number                                                 | 6         |
| v-scrollbar-size          | 配置表格的垂直滚动条大小，防止水平和垂直滚动条重叠。                          | Number                                                 | 6         |
| scrollbar-always-on       | 如果开启，滚动条将一直显示，反之只会在鼠标经过时显示。                         | Boolean                                                | false     |
| sort-by                   | 排序方式                                                | Object\<[SortBy](#typings)\>                         | {}        |
| sort-state                | 多个排序                                                | Object\<[SortState](#typings)\>                      | undefined |

## TableV2 插槽

| 插槽名         | 参数                              |
| ----------- | ------------------------------- |
| cell        | [CellSlotProps](#typings)       |
| header      | [HeaderSlotProps](#typings)     |
| header-cell | [HeaderCellSlotProps](#typings) |
| row         | [RowSlotProps](#typings)        |
| footer      | -                               |
| empty       | -                               |
| overlay     | -                               |

## TableV2 事件

| 事件名                  | 描述                | 参数                                         |
| -------------------- | ----------------- | ------------------------------------------ |
| column-sort          | 列排序时调用            | Object\<ColumnSortParam\>                |
| expanded-rows-change | 行展开状态改变时触发        | `Array<KeyType>`                     |
| end-reached          | 到达表格末尾时触发         | -                                          |
| scroll               | 表格被用户滚动后触发        | Object\<[ScrollParams](#typings)\>       |
| rows-rendered        | 当行被渲染后触发          | Object\<[RowsRenderedParams](#typings)\> |
| row-expand           | 点击箭头图标展开/折叠树节点时触发 | Object\<[RowExpandParams](#typings)\>    |
| row-event-handlers   | 当每行添加了一系列事件处理器时触发 | Object\<[RowEventHandlers](#typings)\>   |

## TableV2 方法

| 事件名          | 描述              | 参数                                                                             |
| ------------ | --------------- | ------------------------------------------------------------------------------ |
| scrollTo     | 滚动到给定位置         | `{ scrollLeft?: number, scrollTop?: number}`                                   |
| scrollToLeft | 滚动到给定的水平位置      | `scrollLeft: number`                                                           |
| scrollToTop  | 滚动到给定的垂直位置      | `scrollTop: number`                                                            |
| scrollToRow  | 使用给定的滚动策略滚动至指定行 | `row: number, strategy?: "auto" \|"center" \| "end" \| "start" \| "smart"` |

:::tip

请注意：这些是 `JavaScript` 对象，所以您 **不能使用** 短横线命名法（kebab-case）来处理这些属性

:::

## Column 属性

| 属性名                | 描述                              | 类型                                                                                                                                                               | 默认值   |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| align              | 表格单元格内容对齐方式                     | [Alignment](https://github.com/element-plus/element-plus/blob/b92b22932758f0ddea98810ae248f6ca62f77e25/packages/components/table-v2/src/constants.ts#L6)         | left  |
| class              | 列的类名                            | String                                                                                                                                                           | -     |
| fixed              | 固定列位置                           | Boolean/[FixedDir](https://github.com/element-plus/element-plus/blob/b92b22932758f0ddea98810ae248f6ca62f77e25/packages/components/table-v2/src/constants.ts#L11) | false |
| flexGrow           | CSS 属性 flex grow, 仅当不是固定表时才生效   | Number                                                                                                                                                           | 0     |
| flexShrink         | CSS 属性 flex shrink, 仅当不是固定表时才生效 | Number                                                                                                                                                           | 1     |
| headerClass        | 自定义 header 头部类名                 | String                                                                                                                                                           | -     |
| hidden             | 此列是否不可见                         | Boolean                                                                                                                                                          | -     |
| style              | 自定义列单元格的类名，将会与 gird 单元格合并       | CSSProperties                                                                                                                                                    | -     |
| sortable           | 设置列是否可排序                        | Boolean                                                                                                                                                          | -     |
| title              | Header 头部单元格中的默认文本              | String                                                                                                                                                           | -     |
| maxWidth           | 列的最大宽度                          | String                                                                                                                                                           | -     |
| minWidth           | 列的最小宽度                          | String                                                                                                                                                           | -     |
| width ^(required)  | 列宽度                             | Number                                                                                                                                                           | -     |
| cellRenderer       | 自定义单元格渲染器                       | VueComponent/(props: [CellRenderProps](#typings)) => VNode                                                                                                       | -     |
| headerCellRenderer | 自定义头部渲染器                        | VueComponent/(props: [HeaderRenderProps](#typings)) => VNode                                                                                                     | -     |

## Typings{#typings}

<details>
<summary>显示类型声明</summary>

```ts
type HeaderClassGetter = (param: {
  columns: Column<any>[]
  headerIndex: number
}) => string

type HeaderPropsGetter = (param: {
  columns: Column<any>[]
  headerIndex: number
}) => Record<string, any>

type HeaderCellPropsGetter = (param: {
  columns: Column<any>[]
  column: Column<any>
  columnIndex: number
  headerIndex: number
  style: CSSProperties
}) => Record<string, any>

type RowClassGetter = (param: {
  columns: Column<any>[]
  rowData: any
  rowIndex: number
}) => string

type RowPropsGetter = (param: {
  columns: Column<any>[]
  rowData: any
  rowIndex: number
}) => Record<string, any>

type CellPropsGetter = (param: {
  column: Column<any>
  columns: Column<any>[]
  columnIndex: number
  cellData: any
  rowData: any
  rowIndex: number
}) => void

type CellRenderProps<T> = {
  cellData: T
  column: Column<T>
  columns: Column<T>[]
  columnIndex: number
  rowData: any
  rowIndex: number
}

type HeaderRenderProps<T> = {
  column: Column<T>
  columns: Column<T>[]
  columnIndex: number
  headerIndex: number
}

type ScrollParams = {
  xAxisScrollDir: 'forward' | 'backward'
  scrollLeft: number
  yAxisScrollDir: 'forward' | 'backward'
  scrollTop: number
}

type CellSlotProps<T> = {
  column: Column<T>
  columns: Column<T>[]
  columnIndex: number
  depth: number
  style: CSSProperties
  rowData: any
  rowIndex: number
  isScrolling: boolean
  expandIconProps?:
    | {
        rowData: any
        rowIndex: number
        onExpand: (expand: boolean) => void
      }
    | undefined
}

type HeaderSlotProps = {
  cells: VNode[]
  columns: Column<any>[]
  headerIndex: number
}

type HeaderCellSlotProps = {
  class: string
  columns: Column<any>[]
  column: Column<any>
  columnIndex: number
  headerIndex: number
  style: CSSProperties
  headerCellProps?: any
  sortBy: SortBy
  sortState?: SortState | undefined
  onColumnSorted: (e: MouseEvent) => void
}

type RowCommonParams = {
  rowData: any
  rowIndex: number
}

type RowEventHandlerParams = {
  rowKey: KeyType
  event: Event
} & RowCommonParams

type RowEventHandler = (params: RowEventHandlerParams) => void
type RowEventHandlers = {
  onClick?: RowEventHandler
  onContextmenu?: RowEventHandler
  onDblclick?: RowEventHandler
  onMouseenter?: RowEventHandler
  onMouseleave?: RowEventHandler
}

type RowsRenderedParams = {
  rowCacheStart: number
  rowCacheEnd: number
  rowVisibleStart: number
  rowVisibleEnd: number
}

type RowSlotProps = {
  columns: Column<any>[]
  rowData: any
  columnIndex: number
  rowIndex: number
  data: any
  key: number | string
  isScrolling?: boolean
  style: CSSProperties
}

type RowExpandParams = {
  expanded: boolean
  rowKey: KeyType
} & RowCommonParams

type Data = {
  [key: KeyType]: any
  children?: Array<any>
}

type FixedData = Data

type KeyType = string | number | symbol

type ColumnSortParam<T> = { column: Column<T>; key: KeyType; order: SortOrder }

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

type SortBy = { key: KeyType; Order: SortOrder }
type SortState = Record<KeyType, SortOrder>
```

</details>

## 常见问题

#### 如何在第一列中渲染带复选框的列表？

由于可以自己定义单元格渲染器，您可以根据示例 [自定义单元格渲染器](#customize-cell-renderer) 代码来渲染 `checkbox`，并自行管理其状态。

#### 为什么虚拟化表提供的功能较 [TableV1](./table.md) 少？

对于虚拟化表格，我们打算减少一些功能，让用户根据需求自行实现。 整合过多的功能会让组件的代码变得难以维护，且对于大多数用户来说，基础功能就已足够。 一些主要的功能尚未开发。 我们很希望听从您的意见。 进入 [Discord](https://discord.com/invite/gXK9XNzW3X) 持续关注.
