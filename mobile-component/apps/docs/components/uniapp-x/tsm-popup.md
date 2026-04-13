# Popup 组件

popup 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| show | 是否显示弹窗 | boolean | 否 | false |
| overlay | 是否显示遮罩 | boolean | 否 | true |
| mode | 弹出方向: top | bottom | left | right | center | 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' | 否 | 'bottom' |
| duration | 动画时长，单位ms | number | 否 | 300 |
| closeable | 是否显示关闭图标 | boolean | 否 | false |
| closeOnClickOverlay | 点击遮罩是否关闭弹窗 | boolean | 否 | true |
| zIndex | 层级 | number | 否 | 10075 |
| safeAreaInsetBottom | 是否为iPhoneX留出底部安全距离 | boolean | 否 | true |
| safeAreaInsetTop | 是否留出顶部安全距离 | boolean | 否 | false |
| round | 圆角值 | number | 否 | 0 |
| bgColor | 弹窗背景色 | string | 否 | '#ffffff' |
| overlayOpacity | 遮罩透明度 | number | 否 | 0.5 |
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