# Loadmore 组件

loadmore 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| status | 加载状态 | 'loadmore' \| 'loading' \| 'nomore' | 否 | 'loadmore' |
| loadmoreText | 加载更多文字 | string | 否 | '加载更多' |
| loadingText | 加载中文字 | string | 否 | '加载中...' |
| nomoreText | 没有更多文字 | string | 否 | '没有更多了' |
| isDot | 是否虚线 | boolean | 否 | false |
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