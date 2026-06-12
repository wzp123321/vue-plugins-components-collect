# Action-sheet 组件

action-sheet 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名           | 说明                                        | 类型                                                                             | 是否必填 | 默认值   |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------------------------- | -------- | -------- |
| show             | 是否显示                                    | boolean                                                                          | 否       | false    |
| actions          | 菜单项列表                                  | ActionItem[]                                                                     | 否       | () => [] |
| cancelText       | 取消按钮文字                                | string                                                                           | 否       | '取消'   |
| showCancel       | 是否显示取消按钮                            | boolean                                                                          | 否       | true     |
| title            | 标题（兼容旧版）                            | string                                                                           | 否       | -        |
| description      | 顶部描述                                    | string                                                                           | 否       | -        |
| descriptionAlign | 顶部描述对齐方式                            | 'center' \| 'left'                                                               | 否       | 'center' |
| itemAlign        | 按钮内容对齐方式（仅列表模式）              | 'center' \| 'left'                                                               | 否       | 'center' |
| maxHeight        | 列表最大高度                                | string                                                                           | 否       | '70vh'   |
| mode             | 面板模式：list（列表）、grid（宫格）        | 'list' \| 'grid'                                                                 | 否       | 'list'   |
| gridMode         | 宫格布局方式：stack（堆叠）、scroll（滚动） | 'stack' \| 'scroll'                                                              | 否       | 'stack'  |
| beforeClose      | 关闭前回调，返回 false 可阻止关闭           | (action: 'select' \| 'cancel' \| 'overlay') => boolean \| Promise&lt;boolean&gt; | 否       | -        |
| textKey          | 按钮文字对应的字段名，默认 label            | string                                                                           | 否       | 'label'  |
| valueKey         | 按钮值对应的字段名                          | string                                                                           | 否       | -        |
| customClass      | 自定义类名                                  | string                                                                           | 否       | -        |
| customStyle      | 自定义样式                                  | object                                                                           | 否       | {}       |

## Slots

| 插槽名             | 说明                                                        | 作用域参数      |
| ------------------ | ----------------------------------------------------------- | --------------- |
| action-${index}    | 自定义列表模式下每个菜单项的内容，index 为 actions 数组下标 | { item, index } |
| grid-icon-${index} | 自定义宫格模式下每个项的图标，index 为 actions 数组下标     | { item, index } |

<style>
table {
  width: 100%;
  table-layout: fixed;
}
table th,
table td {
  word-break: break-all;
}
</style>
