# Tabs 组件

tabs 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| list | 标签列表 | TabItem[] | 否 | () => [] |
| current | 当前激活的标签索引 | number | 否 | 0 |
| lineColor | 滑块颜色 | string | 否 | '#2979ff' |
| lineWidth | 滑块宽度 | number \| string | 否 | '40rpx' |
| lineHeight | 滑块高度 | number \| string | 否 | '3px' |
| duration | 滑块移动动画时长 | number | 否 | 300 |
| activeStyle | 激活状态样式 | object | 否 | { color |
| inactiveStyle | 未激活状态样式 | object | 否 | - |
| itemStyle | 标签项样式 | object | 否 | - |
| scrollable | 是否可滚动 | boolean | 否 | - |
| keyName | 从list元素对象中读取的键名 | string | 否 | - |
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