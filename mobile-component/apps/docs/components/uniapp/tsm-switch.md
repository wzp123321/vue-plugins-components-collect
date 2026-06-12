# Switch 组件

switch 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名        | 说明                             | 类型                          | 是否必填 | 默认值                          |
| ------------- | -------------------------------- | ----------------------------- | -------- | ------------------------------- | ----- | -------------------------------- | --- | -------- |
| checked       | 是否选中                         | `boolean \| string \| number` | 否       | false                           |
| disabled      | 是否禁用                         | `boolean`                     | 否       | false                           |
| readonly      | 是否只读（只展示状态，不可切换） | `boolean`                     | 否       | false                           |
| activeValue   | 选中时的值                       | `boolean \| string \| number` | 否       | true                            |
| inactiveValue | 未选中时的值                     | `boolean \| string \| number` | 否       | false                           |
| activeColor   | 选中时的颜色                     | `string`                      | 否       | 'var(--tsm-color-primary)'      |
| inactiveColor | 未选中时的颜色                   | `string`                      | 否       | 'var(--tsm-color-bg-secondary)' |
| inactiveText  | 是否显示文字                     | `boolean`                     | 否       | false                           |
| size          | 开关尺寸: large                  |                               | medium   |                                 | small | `'large' \| 'medium' \| 'small'` | 否  | 'medium' |
| checkedText   | 选中时的文字                     | `string`                      | 否       | '开'                            |
| unCheckedText | 未选中时的文字                   | `string`                      | 否       | '关'                            |

## Events

| 事件名 | 说明               | 参数                                             |
| ------ | ------------------ | ------------------------------------------------ |
| change | 开关状态变化时触发 | `[checked: boolean \| string \| number]`         |
| update | 更新开关状态       | `checked': [value: boolean \| string \| number]` |

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
