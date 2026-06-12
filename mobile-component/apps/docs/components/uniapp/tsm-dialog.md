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

| 事件名  | 说明               | 参数                         |
| ------- | ------------------ | ---------------------------- |
| confirm | 点击确认按钮时触发 | `-`                          |
| cancel  | 点击取消按钮时触发 | `-`                          |
| close   | 关闭弹窗时触发     | `-`                          |
| update  | 更新显示状态       | `visible': [value: boolean]` |

## Slots

| 插槽名         | 说明                                                             |
| -------------- | ---------------------------------------------------------------- |
| header-content | 插槽：header-content - 自定义头部内容（type="customize" 时使用） |
| content        | 插槽：content - 自定义内容区域内容                               |
| footer         | 插槽：footer - 自定义底部按钮区域内容                            |

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
