# List 组件

list 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| loading | 是否加载中 | boolean | 否 | false |
| finished | 是否加载完成 | boolean | 否 | false |
| finishedText | 加载完成文字 | string | 否 | '没有更多了' |
| errorText | 加载失败文字 | string | 否 | '加载失败，点击重试' |
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