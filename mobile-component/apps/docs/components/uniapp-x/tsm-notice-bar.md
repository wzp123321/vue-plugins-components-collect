# Notice-bar 组件

notice-bar 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| text | 通知文本 | string | 否 | - |
| speed | 滚动速度 | number | 否 | 50 |
| showIcon | 是否显示左侧图标 | boolean | 否 | true |
| showClose | 是否显示关闭按钮 | boolean | 否 | false |
| bgColor | 背景颜色 | string | 否 | '#fdf6ec' |
| color | 文字颜色 | string | 否 | '#e6a23c' |
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