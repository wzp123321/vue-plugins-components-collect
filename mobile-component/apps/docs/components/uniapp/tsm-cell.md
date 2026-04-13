# Cell 组件

cell 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| title | 标题 | string \| number | 否 | - |
| label | 描述信息 | string \| number | 否 | - |
| value | 右侧内容 | string \| number | 否 | - |
| icon | 左侧图标 | string | 否 | - |
| disabled | 是否禁用 | boolean | 否 | false |
| border | 是否显示下边框 | boolean | 否 | true |
| center | 是否垂直居中 | boolean | 否 | false |
| url | 点击后跳转的链接地址 | string | 否 | - |
| linkType | 链接跳转类型 | string | 否 | 'navigateTo' |
| clickable | 是否开启点击反馈 | boolean | 否 | false |
| isLink | 是否展示右侧箭头 | boolean | 否 | false |
| required | 是否显示必填星号 | boolean | 否 | false |
| rightIcon | 右侧箭头图标 | string | 否 | 'arrow-right' |
| arrowDirection | 箭头方向 | 'up' \| 'down' \| 'left' \| 'right' | 否 | undefined |
| titleStyle | 标题样式 | CSSProperties \| string | 否 | {} |
| size | 单元格大小 | 'large' \| 'normal' | 否 | - |
| stop | 是否阻止事件传播 | boolean | 否 | - |
| name | 单元格标识 | number \| string | 否 | - |
| customClass | 自定义类名 | string | 否 | - |
| customStyle | 自定义样式 | object | 否 | - |

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