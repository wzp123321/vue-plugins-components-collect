# Button 组件

button 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| type | 按钮类型 | 'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' | 否 | 'info' |
| size | 按钮大小 | 'large' \| 'normal' \| 'small' \| 'mini' | 否 | 'normal' |
| shape | 按钮形状 | 'square' \| 'circle' | 否 | 'square' |
| disabled | 是否禁用 | boolean | 否 | false |
| loading | 是否显示加载状态 | boolean | 否 | false |
| loadingText | 加载状态文字 | string | 否 | - |
| text | 按钮文字 | string | 否 | - |
| color | 自定义颜色 | string | 否 | - |
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