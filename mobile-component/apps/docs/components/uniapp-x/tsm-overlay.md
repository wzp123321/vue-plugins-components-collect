# Overlay 组件

overlay 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| show | 是否显示 | boolean | 否 | false |
| zIndex | 层级 | number | 否 | 1000 |
| opacity | 遮罩透明度 | number | 否 | 0.5 |
| duration | 动画时长 | number | 否 | 300 |
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