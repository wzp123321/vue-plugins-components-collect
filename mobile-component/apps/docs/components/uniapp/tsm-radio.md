# Radio 组件

radio 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| name | 单选框的名称/标识 | string \| number | 否 | - |
| checked | 是否选中 | boolean | 否 | false |
| disabled | 是否禁用 | boolean | 否 | false |
| shape | 单选框形状 | 'circle' \| 'square' | 否 | 'circle' |
| activeColor | 选中时的颜色 | string | 否 | '#2979ff' |
| inactiveColor | 未选中时的颜色 | string | 否 | '#c8c9cc' |
| size | 单选框大小 | number \| string | 否 | 21 |
| iconSize | 图标大小 | number \| string | 否 | 12 |
| iconColor | 图标颜色 | string | 否 | '#ffffff' |
| label | 标签文字 | string | 否 | - |
| labelColor | 标签文字颜色 | string | 否 | '#606266' |
| labelSize | 标签文字大小 | number \| string | 否 | 15 |
| labelDisabled | 是否禁用标签点击 | boolean | 否 | false |
| customClass | 自定义类名 | string | 否 | - |
| customStyle | 自定义样式 | object | 否 | {} |

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