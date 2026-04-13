# Steps 组件

steps 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| current | 当前步骤 | number | 否 | 0 |
| direction | 步骤条方向 | 'horizontal' \| 'vertical' | 否 | 'horizontal' |
| activeColor | 步骤条颜色 | string | 否 | '#2979ff' |
| inactiveColor | 未完成颜色 | string | 否 | '#909399' |
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