# Progress 组件

progress 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                                                  | 类型                               | 是否必填 | 默认值 |
| ----------- | --------------------------------------------------------------------- | ---------------------------------- | -------- | ------ |
| percentage  | 进度百分比                                                            | number                             | 是       | 0      |
| type        | 进度条类型                                                            | 'line' 'circle'                    | 否       | 'line' |
| textInside  | 进度条显示文字内置在进度条内,此时进度条高度适当增加（仅line类型可用） | boolean                            | 否       | false  |
| status      | 进度条状态                                                            | 'success' 'error' 'warning' 'info' | 否       | 'info' |
| showText    | 是否显示进度条文字                                                    | boolean                            | 否       | true   |
| formatText  | 自定义进度条文字格式                                                  | (percentage: number) => string     | 否       | -      |
| customClass | 自定义类名                                                            | string                             | 否       | -      |
| customStyle | 自定义样式                                                            | object                             | 否       | {}     |
