# Button 组件

button 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                                                                                                        | 类型        | 是否必填 | 默认值                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- | -------------------------- |
| type        | 按钮样式类型：solid（实心）、outline（描边）、text（文字）、link（链接）、dash（虚线）、ghost（幽灵）、iconText（图标文字） | ButtonType  | 否       | 'solid' as ButtonType      |
| theme       | 按钮语义主题：primary（主色）、default（默认）、danger（危险）                                                              | ButtonTheme | 否       | 'default' as ButtonTheme   |
| size        | 按钮尺寸：xs(24px)、s(32px)、m(40px)、l(48px)，link 类型只支持 s、m                                                         | ButtonSize  | 否       | 'm' as ButtonSize          |
| shape       | 按钮形状：rectangle（矩形）、round（圆角）、circle（圆形）                                                                  | ButtonShape | 否       | 'rectangle' as ButtonShape |
| long        | 是否长按钮（宽度随容器适配）                                                                                                | boolean     | 否       | false                      |
| prefixIcon  | 是否显示前缀图标                                                                                                            | boolean     | 否       | false                      |
| suffixIcon  | 是否显示后缀图标                                                                                                            | boolean     | 否       | false                      |
| disabled    | 是否禁用                                                                                                                    | boolean     | 否       | false                      |
| loading     | 是否显示加载状态                                                                                                            | boolean     | 否       | false                      |
| loadingText | 加载状态文字                                                                                                                | string      | 否       | -                          |
| text        | 按钮文字                                                                                                                    | string      | 否       | -                          |
| color       | 自定义颜色（优先级高于 theme）                                                                                              | string      | 否       | -                          |
| customClass | 自定义类名                                                                                                                  | string      | 否       | -                          |
| customStyle | 自定义样式                                                                                                                  | object      | 否       | {}                         |

## Slots

| 插槽名      | 说明                             |
| ----------- | -------------------------------- |
| default     | 默认插槽，自定义按钮内容         |
| prefix-icon | 前缀图标插槽                     |
| loading     | 加载状态自定义内容               |
| suffix      | 后缀图标插槽（通用）             |
| suffix-icon | 后缀图标插槽（仅 iconText 类型） |

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
