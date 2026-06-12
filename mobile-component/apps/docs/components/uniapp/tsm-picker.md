# Picker 组件

picker 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名       | 说明                                  | 类型                | 是否必填 | 默认值                     |
| ------------ | ------------------------------------- | ------------------- | -------- | -------------------------- |
| options      | 选项数组                              | `PickerOption<T>[]` | 是       | () => [] as PickerOption[] |
| show         | 弹层显示状态（v-model:show）          | `boolean`           | 是       | false                      |
| title        | 标题文本                              | `string`            | 否       | -                          |
| value        | 当前选中值（v-model:value，受控模式） | `T`                 | 否       | -                          |
| defaultValue | 默认选中值（非受控模式）              | `T`                 | 否       | -                          |
| confirmText  | 确认按钮文字                          | `string`            | 否       | '确定'                     |
| customClass  | 自定义类名                            | `string`            | 否       | -                          |
| customStyle  | 自定义样式                            | `object`            | 否       | {}                         |

## Events

| 事件名       | 说明              | 参数                      |
| ------------ | ----------------- | ------------------------- |
| confirm      | 确认事件          | `value: string \| number` |
| cancel       | 取消事件          | `-`                       |
| change       | 选项变更事件      | `value: string \| number` |
| update:show  | 同步显示/隐藏状态 | `value: boolean`          |
| update:value | 同步选中值        | `value: string \| number` |

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
