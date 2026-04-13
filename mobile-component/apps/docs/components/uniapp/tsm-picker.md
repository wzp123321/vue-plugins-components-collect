# Picker 组件

picker 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| show | 是否显示 | boolean | 否 | false |
| title | 选择器标题 | string | 否 | - |
| columns | 选项列表 | any[] \| PickerColumn[] | 否 | () => [] |
| defaultIndex | 当前选中项的索引 | number | 否 | 0 |
| showCancelButton | 是否显示取消按钮 | boolean | 否 | true |
| showConfirmButton | 是否显示确认按钮 | boolean | 否 | true |
| cancelText | 取消按钮文字 | string | 否 | '取消' |
| confirmText | 确认按钮文字 | string | 否 | '确认' |
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