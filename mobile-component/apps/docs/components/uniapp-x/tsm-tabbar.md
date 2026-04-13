# Tabbar 组件

tabbar 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 当前选中项的值 | number \| string | 否 | 0 |
| fixed | 是否固定在底部 | boolean | 否 | true |
| activeColor | 选中颜色 | string | 否 | '#2979ff' |
| inactiveColor | 未选中颜色 | string | 否 | '#909399' |
| bgColor | 背景颜色 | string | 否 | '#ffffff' |
| borderTop | 是否显示顶部边框 | boolean | 否 | true |
| safeAreaInsetBottom | 是否为iPhoneX留出底部安全距离 | boolean | 否 | true |
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