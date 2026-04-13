# Avatar-group 组件

avatar-group 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| urls | 头像列表 | string[] | 否 | () => [] |
| size | 头像大小 | number \| string | 否 | 40 |
| shape | 头像形状 | 'circle' \| 'square' | 否 | 'circle' |
| maxCount | 最大显示数量 | number | 否 | 5 |
| gap | 头像间距 | number | 否 | -10 |
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