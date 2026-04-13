# Upload 组件

upload 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| fileList | 已上传的文件列表 | any[] | 否 | () => [] |
| maxCount | 最大上传数量 | number | 否 | 9 |
| disabled | 是否禁用 | boolean | 否 | false |
| action | 上传地址 | string | 否 | - |
| headers | 上传请求头 | Record<string, any> | 否 | {} |
| name | 上传文件字段名 | string | 否 | - |
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