# Message 组件

message 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| top | 到顶部的距离 | number \| string | 否 | 0 |
| type | 主题类型 | 'primary' \| 'success' \| 'warning' \| 'error' | 否 | 'primary' |
| color | 字体颜色 | string | 否 | '#ffffff' |
| bgColor | 背景颜色 | string | 否 | - |
| message | 展示的文字内容 | string | 否 | - |
| duration | 展示时长，为0时不消失，单位ms | number | 否 | 3000 |
| fontSize | 字体大小 | number \| string | 否 | 15 |
| safeAreaInsetTop | 是否留出顶部安全距离 | boolean | 否 | false |
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