# Badge 组件

badge 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| isDot | 是否显示圆点 | boolean | 否 | false |
| value | 显示的内容 | number \| string | 否 | - |
| show | 是否显示 | boolean | 否 | true |
| max | 最大值 | number \| string | 否 | 999 |
| type | 主题类型 | 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' | 否 | 'error' |
| showZero | 当数值为 0 时，是否展示 Badge | boolean | 否 | false |
| bgColor | 背景颜色 | string | 否 | - |
| color | 字体颜色 | string | 否 | '#ffffff' |
| shape | 徽标形状 | 'circle' \| 'horn' | 否 | 'circle' |
| numberType | 数字显示方式 | 'overflow' \| 'ellipsis' \| 'limit' | 否 | 'overflow' |
| offset | 位置偏移 [x, y] | [string \| number, string \| number] | 否 | [0 |
| inverted | 是否反转背景和字体颜色 | boolean | 否 | false |
| absolute | 是否绝对定位 | boolean | 否 | false |
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