# Calendar 组件

calendar 组件的描述信息

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
| value | 当前选中的日期 | string | 否 | - |
| minDate | 最小可选日期 | string | 否 | - |
| maxDate | 最大可选日期 | string | 否 | - |
| title | 选择器标题 | string | 否 | '选择日期' |
| showConfirm | 是否显示确认按钮 | boolean | 否 | true |
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