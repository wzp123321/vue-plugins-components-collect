# Badge 组件

badge 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名   | 说明                                                                                                | 类型                                                       | 是否必填 | 默认值    |
| -------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- | --------- |
| isDot    | 是否显示圆点                                                                                        | `boolean`                                                  | 否       | false     |
| value    | 显示的内容                                                                                          | `number \| string`                                         | 否       | -         |
| show     | 是否显示                                                                                            | `boolean`                                                  | 否       | true      |
| max      | 最大值                                                                                              | `number \| string`                                         | 否       | 999       |
| mode     | 模式，配合 theme 控制颜色；                                                                         | `'primary' \| 'success' \| 'warning' \| 'info' \| 'error'` | 否       | 'error'   |
| showZero | 当数值为 0 时，是否展示 Badge                                                                       | `boolean`                                                  | 否       | false     |
| shape    | 徽标形状, 默认 circle, 可选 ribbon-right: 从右到左, 从左到右, ribbon-round: 圆角, 圆形 bubble: 气泡 | `'circle' \| 'ribbon-right' \| 'ribbon-round' \| 'bubble'` | 否       | 'circle'  |
| theme    | 主题模式, 默认 default，light 模式下使用浅色背景和主题色文字                                        | `'default' \| 'light'`                                     | 否       | 'default' |
| size     | 徽标大小, 默认 medium, 可选 large: 大号                                                             | `'medium' \| 'large'`                                      | 否       | 'medium'  |

## Events

| 事件名 | 说明 | 参数 |
| ------ | ---- | ---- |
| click  | -    | `-`  |

## Slots

| 插槽名  | 说明 |
| ------- | ---- |
| default | -    |

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
