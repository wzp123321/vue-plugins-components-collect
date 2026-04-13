# Loading-page 组件

loading-page 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| mode | 加载图标类型 | 'circle' \| 'flower' | 否 | 'circle' |
| iconSize | 图标大小 | number \| string | 否 | 32 |
| iconColor | 图标颜色 | string | 否 | '#2979ff' |
| text | 加载文字 | string | 否 | '加载中...' |
| textColor | 文字颜色 | string | 否 | '#909399' |
| bgColor | 背景颜色 | string | 否 | '#ffffff' |
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