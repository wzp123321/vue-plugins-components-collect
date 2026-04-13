# Image 组件

image 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| src | 图片地址 | string | 否 | - |
| mode | 裁剪模式 | string | 否 | 'aspectFill' |
| width | 宽度 | string \| number | 否 | '300' |
| height | 高度 | string \| number | 否 | '225' |
| shape | 图片形状 | 'circle' \| 'square' | 否 | 'square' |
| radius | 圆角值 | string \| number | 否 | 0 |
| lazyLoad | 是否懒加载 | boolean | 否 | true |
| showMenuByLongpress | 是否开启长按图片显示菜单 | boolean | 否 | false |
| showLoading | 是否显示加载中的图标 | boolean | 否 | true |
| showError | 是否显示加载错误的图标 | boolean | 否 | true |
| fade | 是否需要淡入效果 | boolean | 否 | true |
| duration | 过渡时间，单位ms | number | 否 | 500 |
| bgColor | 背景颜色 | string | 否 | '#f3f4f6' |
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