# Datetime-picker 组件

datetime-picker 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名  | 说明             | 类型                                                                                                             | 是否必填 | 默认值                                       |
| ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| value   | 当前选中值       | `string \| number \| [string \| number, string \| number]`                                                       | 否       | -                                            |
| mode    | 选择器类型       | `'date' \| 'month' \| 'year' \| 'hour' \| 'minute' \| 'second' \| 'date-hour' \| 'date-minute' \| 'date-second'` | 否       | 'date'                                       |
| minDate | 最小可选日期     | `number`                                                                                                         | 否       | Date.now() - 10 _ 365 _ 24 _ 60 _ 60 \* 1000 |
| maxDate | 最大可选日期     | `number`                                                                                                         | 否       | Date.now() + 10 _ 365 _ 24 _ 60 _ 60 \* 1000 |
| show    | 是否显示         | `boolean`                                                                                                        | 否       | false                                        |
| title   | 标题             | `string`                                                                                                         | 否       | -                                            |
| range   | 是否开启范围选择 | `boolean`                                                                                                        | 否       | false                                        |

## Events

| 事件名  | 说明                         | 参数                         |
| ------- | ---------------------------- | ---------------------------- |
| confirm | 确认选择时触发，携带选中的值 | `[value: DateValue]`         |
| close   | 关闭弹窗时触发               | `-`                          |
| update  | 双向绑定更新事件             | `value': [value: DateValue]` |

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
