# Tag 组件

tag 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| type | 标签类型 | 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' | 否 | 'info' |
| size | 标签大小 | 'small' \| 'medium' \| 'large' | 否 | 'medium' |
| shape | 标签形状 | 'square' \| 'circle' \| 'mark' | 否 | 'square' |
| text | 标签文字 | string | 否 | - |
| bgColor | 背景颜色 | string | 否 | - |
| color | 文字颜色 | string | 否 | - |
| closable | 是否可关闭 | boolean | 否 | false |
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