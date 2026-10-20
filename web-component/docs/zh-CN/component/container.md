---
title: Container 布局容器
lang: zh-CN
---

# Container 布局容器

用于布局的容器组件，方便快速搭建页面的基本结构：

`<te-container>`：外层容器。 当子元素中包含 `<te-header>` 或 `<te-footer>` 时，全部子元素会垂直上下排列， 否则会水平左右排列。

`<te-header>`：顶栏容器。

`<te-aside>`：侧边栏容器。

`<te-main>`：主要区域容器。

`<te-footer>`：底栏容器。

:::tip

以上组件采用了 flex 布局，使用前请确定目标浏览器是否兼容。 此外， `<te-container>`的直接子元素必须是后四个组件中的一个或多个。 后四个组件的亲元素必须是一个 `<te-container>`

:::

## 常见页面布局

<style lang="scss">
@use '../../examples/container/common-layout.scss';
</style>

:::demo

container/layout-hm

:::

:::demo

container/layout-hmf

:::

:::demo

container/layout-am

:::

:::demo

container/layout-ham

:::

:::demo

container/layout-hamf

:::

:::demo

container/layout-ahm

:::

:::demo

container/layout-ahmf

:::

## 例子

:::demo

container/example

:::

## Container API

### Container Attributes

| 属性名       | 说明       | 类型                                   | 默认值                                                        |
| --------- | -------- | ------------------------------------ | ---------------------------------------------------------- |
| direction | 子元素的排列方向 | ^[enum]`'horizontal' \| 'vertical'` | 子元素中有 `te-header` 或 `te-footer` 时为 vertical，否则为 horizontal |

### Container Slots

| 插槽名     | 说明      | 子标签                                        |
| ------- | ------- | ------------------------------------------ |
| default | 自定义默认内容 | Container / Header / Aside / Main / Footer |

## Header API

### Header Attributes

| 属性名    | 说明   | 类型        | 默认值  |
| ------ | ---- | --------- | ---- |
| height | 顶栏高度 | ^[string] | 60px |

### Header Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |

## Aside API

### Aside Attributes

| 属性名   | 说明    | 类型        | 默认值   |
| ----- | ----- | --------- | ----- |
| width | 侧边栏宽度 | ^[string] | 300px |

### Aside Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |

## Main API

### Main Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |

## Footer API

### Footer Attributes

| 属性名    | 说明   | 类型        | 默认值  |
| ------ | ---- | --------- | ---- |
| height | 底栏高度 | ^[string] | 60px |

### Footer Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |
