# Dialog 组件

dialog 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| show | 是否显示对话框 | boolean | 否 | false |
| title | 标题内容 | string | 否 | - |
| content | 对话框内容 | string | 否 | - |
| confirmText | 确认按钮文字 | string | 否 | '确认' |
| cancelText | 取消按钮文字 | string | 否 | '取消' |
| showConfirmButton | 是否显示确认按钮 | boolean | 否 | true |
| showCancelButton | 是否显示取消按钮 | boolean | 否 | false |
| confirmColor | 确认按钮颜色 | string | 否 | '#2979ff' |
| cancelColor | 取消按钮颜色 | string | 否 | '#606266' |
| buttonReverse | 是否对调确认和取消按钮位置 | boolean | 否 | false |
| zoom | 是否开启缩放模式 | boolean | 否 | true |
| asyncClose | 是否异步关闭 | boolean | 否 | false |
| closeOnClickOverlay | 是否允许点击遮罩关闭 | boolean | 否 | false |
| width | 对话框宽度 | string \| number | 否 | '650rpx' |
| duration | 弹窗动画时间 | number | 否 | 400 |
| contentTextAlign | 内容文字对齐方式 | 'left' \| 'center' \| 'right' | 否 | 'left' |
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