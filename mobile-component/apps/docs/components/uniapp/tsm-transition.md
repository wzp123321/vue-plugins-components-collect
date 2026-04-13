# Transition 组件

transition 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| show | 是否显示 | boolean | 否 | false |
| mode | 动画模式 | 'fade' \| 'slide-up' \| 'slide-down' \| 'slide-left' \| 'slide-right' \| 'zoom' | 否 | 'fade' |
| duration | 动画时长 | number | 否 | 300 |
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