# Toast 组件

toast 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| message | 提示内容 | string | 否 | - |
| type | 主题类型 | 'primary' \| 'success' \| 'warning' \| 'error' \| 'loading' \| 'default' | 否 | 'default' |
| duration | 展示时长，-1表示不消失 | number | 否 | 2000 |
| icon | 是否显示图标 | boolean \| string | 否 | true |
| position | 显示位置 | 'center' \| 'top' \| 'bottom' | 否 | 'center' |
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