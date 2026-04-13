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
| type | - | 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' | 否 | 'info' |
| size | - | 'small' \| 'medium' \| 'large' | 否 | 'medium' |
| shape | - | 'square' \| 'circle' \| 'mark' | 否 | 'square' |
| text | - | string | 否 | - |
| bgColor | - | string | 否 | - |
| color | - | string | 否 | - |
| closable | - | boolean | 否 | false |
| customClass | - | string | 否 | - |
| customStyle | - | object | 否 | {} |

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