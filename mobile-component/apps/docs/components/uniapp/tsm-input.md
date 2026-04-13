# Input 组件

input 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 输入框的值 | string | 否 | - |
| type | 输入框类型 | 'text' \| 'number' \| 'idcard' \| 'digit' \| 'password' \| 'tel' | 否 | 'text' |
| placeholder | 占位符 | string | 否 | - |
| disabled | 是否禁用 | boolean | 否 | false |
| readonly | 是否只读 | boolean | 否 | false |
| maxlength | 最大长度 | number | 否 | -1 |
| clearable | 是否显示清除按钮 | boolean | 否 | false |
| autofocus | 是否自动聚焦 | boolean | 否 | false |
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