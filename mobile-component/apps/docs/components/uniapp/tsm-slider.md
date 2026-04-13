# Slider 组件

slider 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| value | 当前值 | number | 否 | 0 |
| min | 最小值 | number | 否 | 0 |
| max | 最大值 | number | 否 | 100 |
| step | 步长 | number | 否 | 1 |
| disabled | 是否禁用 | boolean | 否 | false |
| blockSize | 滑块大小 | number | 否 | 20 |
| activeColor | 滑块颜色 | string | 否 | '#2979ff' |
| inactiveColor | 背景颜色 | string | 否 | '#ebedf0' |
| blockColor | 进度条颜色 | string | 否 | '#ffffff' |
| showValue | 是否显示当前值 | boolean | 否 | false |
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