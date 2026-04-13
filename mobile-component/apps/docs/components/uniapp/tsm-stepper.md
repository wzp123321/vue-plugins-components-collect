# Stepper 组件

stepper 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                        | 类型             | 是否必填 | 默认值 |
| ----------- | ------------------------------------------- | ---------------- | -------- | ------ |
| modelValue  | 组件定值，用于双向绑定                      | string \| number | 否       | 0      |
| disabled    | 是否禁用                                    | boolean          | 否       | false  |
| small       | 是否为小尺寸组件                            | boolean          | 否       | false  |
| step        | 步长，每次加或减的值， 支持小数值，如需小数 | string \| number | 否       | 1      |
| min         | 最小值                                      | string \| number | 否       | 0      |
| max         | 最大值                                      | string \| number | 否       | 9999   |
| customClass | 自定义类名                                  | string           | 否       | -      |
| customStyle | 自定义样式                                  | object           | 否       | {}     |

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
