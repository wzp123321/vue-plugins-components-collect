# Stepper 组件

stepper 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名     | 说明                                        | 类型               | 是否必填 | 默认值 |
| ---------- | ------------------------------------------- | ------------------ | -------- | ------ |
| modelValue | 组件定值，用于双向绑定                      | `string \| number` | 否       | 0      |
| disabled   | 是否禁用                                    | `boolean`          | 否       | false  |
| readonly   | 是否只读（仅展示当前值，不可操作）          | `boolean`          | 否       | false  |
| small      | 是否为小尺寸组件                            | `boolean`          | 否       | false  |
| step       | 步长，每次加或减的值， 支持小数值，如需小数 | `string \| number` | 否       | 1      |
| min        | 最小值                                      | `string \| number` | 否       | 0      |
| max        | 最大值                                      | `string \| number` | 否       | 9999   |

## Events

| 事件名 | 说明                 | 参数                           |
| ------ | -------------------- | ------------------------------ |
| change | 值变化时触发         | `[value: number]`              |
| update | 更新绑定值           | `modelValue': [value: number]` |
| blur   | 输入框失去焦点时触发 | `[value: number]`              |

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
