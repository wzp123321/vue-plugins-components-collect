# Dialog 组件

dialog 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名              | 说明                 | 类型      | 是否必填 | 默认值  |
| ------------------- | -------------------- | --------- | -------- | ------- | --------- | ---------------------------------------------------------------- | --- | --------- |
| visible             | 是否显示对话框       | `boolean` | 否       | false   |
| type                | 类型 default         | success   | danger   | warning | customize | `'default' \| 'success' \| 'danger' \| 'warning' \| 'customize'` | 否  | 'default' |
| title               | 标题内容             | `string`  | 否       | -       |
| content             | 对话框内容           | `string`  | 否       | -       |
| confirmText         | 确认按钮文字         | `string`  | 否       | '确认'  |
| cancelText          | 取消按钮文字         | `string`  | 否       | '取消'  |
| showConfirmButton   | 是否显示确认按钮     | `boolean` | 否       | true    |
| showCancelButton    | 是否显示取消按钮     | `boolean` | 否       | true    |
| closeOnClickOverlay | 是否允许点击遮罩关闭 | `boolean` | 否       | false   |
| duration            | 弹窗动画时间         | `number`  | 否       | 400     |

## Events

| 事件名  | 说明 | 参数                         |
| ------- | ---- | ---------------------------- |
| confirm | -    | `-`                          |
| cancel  | -    | `-`                          |
| close   | -    | `-`                          |
| update  | -    | `visible': [value: boolean]` |

## Slots

| 插槽名         | 说明 |
| -------------- | ---- |
| header-content | -    |
| content        | -    |
| footer         | -    |

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
