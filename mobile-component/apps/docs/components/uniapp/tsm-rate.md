# Rate 组件

rate 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 当前评分 | number | 否 | 0 |
| max | 最大评分 | number | 否 | 5 |
| size | 图标大小 | number \| string | 否 | 20 |
| activeColor | 选中颜色 | string | 否 | '#ff9900' |
| inactiveColor | 未选中颜色 | string | 否 | '#c8c9cc' |
| disabled | 是否禁用 | boolean | 否 | false |
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