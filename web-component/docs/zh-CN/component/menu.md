---
title: Menu 菜单
lang: zh-CN
---

# Menu 菜单

为网站提供导航功能的菜单。

:::tip

在 SSR 场景下，您需要将组件包裹在 `<client-only></client-only>` 之中 (如: [Nuxt](https://nuxt.com/v3)) 和 SSG (e.g: [VitePress](https://vitepress.vuejs.org/)).

:::

## 顶栏

顶部栏菜单可以在各种场景中使用。

:::demo 导航菜单默认为垂直模式，通过将 mode 属性设置为 horizontal 来使导航菜单变更为水平模式。 另外，在菜单中通过 sub-menu 组件可以生成二级菜单。 Menu 还提供了`background-color`、`text-color`和`active-text-color`，分别用于设置菜单的背景色、菜单的文字颜色和当前激活菜单的文字颜色。

menu/basic

:::

## 左右

:::demo  您可以将菜单项放置在左边或右边。

menu/left-and-right

:::

## 侧栏

垂直菜单，可内嵌子菜单。

:::demo 通过 te-menu-item-group 组件可以实现菜单进行分组，分组名可以通过 title 属性直接设定，也可以通过具名 slot 来设定。

menu/vertical

:::

## Collapse 折叠面板

垂直导航菜单可以被折叠

:::demo

menu/collapse

:::

<!-- ## 弹出层偏移量 ^(2.4.4)

当提供了 popperOffset 配置，会覆盖 Submenu 的 `popper-offset`.

:::demo

menu/popper-offset

::: -->

## Menu Attributes

| 属性名                             | 说明                                                                                       | 类型                     | 可选值                   | 默认值      |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------- | --------------------- | -------- |
| mode                            | 菜单展示模式                                                                                   | string                 | horizontal / vertical | vertical |
| collapse                        | 是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）                                                       | boolean                | —                     | false    |
| ellipsis                        | 是否省略多余的子项（仅在横向模式生效）                                                                      | boolean                | —                     | true     |
| ellipsis-icon ^(2.4.4)          | 自定义省略图标 (仅在水平模式下可用)                                                                      | `string \| Component` | —                     | —        |
| popper-offset ^(2.4.4)          | 弹出层的偏移量(对所有子菜单有效)                                                                        | number                 | —                     | 6        |
| background-color                | 菜单的背景颜色（十六进制格式）（已被废弃，使用`--bg-color`）                                                     | string                 | —                     | #ffffff  |
| text-color                      | 文字颜色（十六进制格式）（已被废弃，使用`--text-color`）                                                      | string                 | —                     | #303133  |
| active-text-color               | 活动菜单项的文本颜色（十六进制格式）（已被废弃，使用`--active-color`）                                              | string                 | —                     | #409EFF  |
| default-active                  | 页面加载时默认激活菜单的 index                                                                       | string                 | —                     | —        |
| default-openeds                 | 默认打开的 sub-menu 的 index 的数组                                                               | Array                  | —                     | —        |
| unique-opened                   | 是否只保持一个子菜单的展开                                                                            | boolean                | —                     | false    |
| menu-trigger                    | 子菜单打开的触发方式，只在 `mode` 为 horizontal 时有效。                                                   | string                 | hover / click         | hover    |
| router                          | 是否启用 `vue-router` 模式。 启用该模式会在激活导航时以 index 作为 path 进行路由跳转 使用 `default-active` 来设置加载时的激活项。 | boolean                | —                     | false    |
| collapse-transition             | 是否开启折叠动画                                                                                 | boolean                | —                     | true     |
| popper-effect ^(2.2.26)         | Tooltip 主题，内置了 `dark` / `light` 两种主题                                                     | string                 | dark / light          | dark     |
| close-on-click-outside ^(2.4.4) | 可选，单击外部时是否折叠菜单                                                                           | `boolean`              | —                     | false    |
| popper-class ^(2.5.0)           | custom class name for all popup menus                                                    | string                 | —                     | —        |
| show-timeout ^(2.5.0)           | Control timeout for all menus before showing                                             | `number`               | —                     | 300      |
| hide-timeout ^(2.5.0)           | Control timeout for all menus before hiding                                              | `number`               | —                     | 300      |

## Menu Methods

| 方法名   | 说明             | 参数                            |
| ----- | -------------- | ----------------------------- |
| open  | 展开指定的 sub-menu | index: 需要打开的 sub-menu 的 index |
| close | 收起指定的 sub-menu | index: 需要收起的 sub-menu 的 index |

## Menu Events

| 事件名    | 说明             | 回调参数                                                                                                           |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| select | 菜单激活回调         | index: 选中菜单项的 index, indexPath: 选中菜单项的 index path, item: 选中菜单项, routeResult: vue-router 的返回值（如果 router 为 true） |
| open   | sub-menu 展开的回调 | index: 打开的 sub-menu 的 index, indexPath: 打开的 sub-menu 的 index path                                              |
| close  | sub-menu 收起的回调 | index: 收起的 sub-menu 的 index, indexPath: 收起的 sub-menu 的 index path                                              |

## Menu Slots

| 插槽名 | 说明      | 子标签                                   |
| --- | ------- | ------------------------------------- |
| —   | 自定义默认内容 | SubMenu / Menu-Item / Menu-Item-Group |

## SubMenu Attributes

| 属性名                        | 说明                                                                                | 类型                     | 可选值 | 默认值                       |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------- | --- | ------------------------- |
| index                      | 唯一标志                                                                              | string                 | —   | —                         |
| popper-class               | 为 popper 添加类名                                                                     | string                 | —   | —                         |
| show-timeout               | timeout before showing a sub-menu(inherit `show-timeout` of the menu by default.) | number                 | —   | —                         |
| hide-timeout               | timeout before hiding a sub-menu(inherit `hide-timeout` of the menu by default.)  | number                 | —   | —                         |
| disabled                   | 是否禁用                                                                              | boolean                | —   | false                     |
| popper-append-to-body（已废弃） | 是否将弹出菜单插入至 body 元素。 在菜单的定位出现问题时，可尝试修改该属性                                          | boolean                | —   | 一级子菜单：true / 非一级子菜单：false |
| teleported                 | 是否将 popup 的下拉列表插入至 body 元素                                                        | boolean                | —   | 一级子菜单：true / 非一级子菜单：false |
| popper-offset              | 弹出窗口的偏移量 (覆盖 `popper`的菜单)                                                         | number                 | —   | —                         |
| expand-close-icon          | 父菜单展开且子菜单关闭时的图标， `expand-close-icon` 和 `expand-open-icon` 需要一起配置才能生效              | `string \| Component` | —   | —                         |
| expand-open-icon           | 父菜单展开且子菜单打开时的图标， `expand-open-icon` 和 `expand-close-icon` 需要一起配置才能生效              | `string \| Component` | —   | —                         |
| collapse-close-icon        | 父菜单收起且子菜单关闭时的图标， `expand-close-icon` 和 `expand-open-icon` 需要一起配置才能生效              | `string \| Component` | —   | —                         |
| collapse-open-icon         | 父菜单收起且子菜单打开时的图标， `expand-open-icon` 和 `expand-close-icon` 需要一起配置才能生效              | `string \| Component` | —   | —                         |

## SubMenu Slots

| 插槽名   | 说明      | 子标签                                   |
| ----- | ------- | ------------------------------------- |
| —     | 自定义默认内容 | SubMenu / Menu-Item / Menu-Item-Group |
| title | 自定义标题内容 | —                                     |

## Menu-Item Attributes

| 属性名      | 说明              | 类型          | 可选值 | 默认值   |
| -------- | --------------- | ----------- | --- | ----- |
| index    | 唯一标志            | string/null | —   | null  |
| route    | Vue Router 路径对象 | object      | —   | —     |
| disabled | 是否禁用            | boolean     | —   | false |

## Menu-Item Events

| 事件名   | 说明         | 回调参数            |
| ----- | ---------- | --------------- |
| click | 菜单点击时的回调函数 | te-menu-item 实例 |

## Menu-Item Slots

| 插槽名   | 说明      |
| ----- | ------- |
| —     | 自定义默认内容 |
| title | 自定义标题内容 |

## Menu-Item-Group Attributes

| 属性名   | 说明  | 类型     | 可选值 | 默认值 |
| ----- | --- | ------ | --- | --- |
| title | 组标题 | string | —   | —   |

## Menu-Item-Group Slots

| 插槽名   | 说明       | 子标签       |
| ----- | -------- | --------- |
| —     | 默认插槽内容   | Menu-Item |
| title | 自定义组标题内容 | —         |
