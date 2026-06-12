# Textarea 组件

textarea 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                       | 类型    | 是否必填 | 默认值   |
| ----------- | -------------------------- | ------- | -------- | -------- |
| value       | 输入框的值                 | string  | 否       | -        |
| placeholder | 占位符                     | string  | 否       | '请输入' |
| disabled    | 是否禁用                   | boolean | 否       | false    |
| maxlength   | 最大长度                   | number  | 否       | -1       |
| autofocus   | 是否自动聚焦               | boolean | 否       | false    |
| showCount   | 是否显示字数统计           | boolean | 否       | false    |
| rows        | 行数                       | number  | 否       | 3        |
| error       | 是否为错误状态（边框变红） | boolean | 否       | false    |
| customClass | 自定义类名                 | string  | 否       | -        |
| customStyle | 自定义样式                 | object  | 否       | {}       |

## Slots

| 插槽名      | 说明               |
| ----------- | ------------------ |
| footer-left | 底部左侧自定义内容 |

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
