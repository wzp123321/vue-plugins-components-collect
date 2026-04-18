# Switch 组件

switch 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名        | 说明            | 类型        | 是否必填 | 默认值                          |
| ------------- | --------------- | ----------- | -------- | ------------------------------- | ----- | --------------------------------------------------------- | --- | ----------------- |
| checked       | 是否选中        | SwitchValue | 否       | false                           |
| disabled      | 是否禁用        | boolean     | 否       | false                           |
| activeValue   | 选中时的值      | SwitchValue | 否       | true                            |
| inactiveValue | 未选中时的值    | SwitchValue | 否       | false                           |
| activeColor   | 选中时的颜色    | string      | 否       | 'var(--tsm-color-primary)'      |
| inactiveColor | 未选中时的颜色  | string      | 否       | 'var(--tsm-color-bg-secondary)' |
| inactiveText  | 是否显示文字    | boolean     | 否       | false                           |
| size          | 开关尺寸: large |             | medium   |                                 | small | SwitchSize.LARGE \| SwitchSize.MEDIUM \| SwitchSize.SMALL | 否  | SwitchSize.MEDIUM |
| checkedText   | 选中时的文字    | string      | 否       | '开'                            |
| unCheckedText | 未选中时的文字  | string      | 否       | '关'                            |
| customClass   | 自定义类名      | string      | 否       | -                               |
| customStyle   | 自定义样式      | object      | 否       | {}                              |

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
