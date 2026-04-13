# Datetime-picker 组件

datetime-picker 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 当前选中值 | string \| number | 否 | - |
| mode | 选择器类型 | 'date' \| 'time' \| 'datetime' | 否 | 'date' |
| minDate | 最小可选日期 | number | 否 | Date.now() - 10 * 365 * 24 * 60 * 60 * 1000 |
| maxDate | 最大可选日期 | number | 否 | Date.now() + 10 * 365 * 24 * 60 * 60 * 1000 |
| show | 是否显示 | boolean | 否 | false |
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