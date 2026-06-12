# Radio 组件

radio 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                                    | 类型                   | 是否必填 | 默认值       |
| ----------- | ------------------------------------------------------- | ---------------------- | -------- | ------------ |
| value       | radio 标识，选中时 radio-group 的 change 事件会携带该值 | string                 | 否       | -            |
| checked     | 当前是否选中                                            | boolean                | 否       | false        |
| disabled    | 是否禁用                                                | boolean                | 否       | false        |
| fillStyle   | 填充样式：fillCircle 填充圆形（默认），line 线条对号    | 'fillCircle' \| 'line' | 否       | 'fillCircle' |
| customClass | 自定义类名                                              | string                 | 否       | -            |
| customStyle | 自定义样式                                              | object                 | 否       | {}           |

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
