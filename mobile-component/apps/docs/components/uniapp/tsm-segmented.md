# Segmented 组件

segmented 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| list | 选项列表 | any[] | 否 | () => [] |
| value | 当前选中项索引 | number | 否 | 0 |
| activeColor | 选中颜色 | string | 否 | '#2979ff' |
| inactiveColor | 未选中颜色 | string | 否 | '#f5f7fa' |
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