# Fab-button 组件

fab-button 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明  | 类型                       | 是否必填 | 默认值      |
| ----------- | ----- | -------------------------- | -------- | ----------- |
| title       | 标题  | `string`                   | 否       | -           |
| type        | type  | `'primary' \| 'secondary'` | 否       | 'primary'   |
| state       | 状态  | `'default' \| 'disabled'`  | 否       | 'default'   |
| shape       | shape | `'rectangle' \| 'circle'`  | 否       | 'rectangle' |
| customStyle | -     | `Record<string, any>`      | 否       | -           |

## Events

| 事件名 | 说明 | 参数         |
| ------ | ---- | ------------ |
| click  | -    | `[e: Event]` |

## Slots

| 插槽名 | 说明 |
| ------ | ---- |
| icon   | -    |

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
