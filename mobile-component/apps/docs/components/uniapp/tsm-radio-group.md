# Radio-group 组件

radio-group 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| modelValue | 选中项的名称 | string \| number | 否 | - |
| disabled | 是否禁用所有单选框 | boolean | 否 | false |
| shape | 单选框形状 | 'circle' \| 'square' | 否 | 'circle' |
| activeColor | 选中时的颜色 | string | 否 | '#2979ff' |
| inactiveColor | 未选中时的颜色 | string | 否 | '#c8c9cc' |
| size | 单选框大小 | number \| string | 否 | 21 |
| iconSize | 图标大小 | number \| string | 否 | 12 |
| iconColor | 图标颜色 | string | 否 | '#ffffff' |
| labelColor | 标签文字颜色 | string | 否 | '#606266' |
| labelSize | 标签文字大小 | number \| string | 否 | 15 |
| labelDisabled | 是否禁用标签点击 | boolean | 否 | false |
| placement | 排列方向 | 'row' \| 'column' | 否 | 'row' |
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