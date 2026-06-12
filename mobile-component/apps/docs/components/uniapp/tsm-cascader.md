# Cascader 组件

cascader 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名        | 说明                 | 类型                  | 是否必填 | 默认值                                                                                  |
| ------------- | -------------------- | --------------------- | -------- | --------------------------------------------------------------------------------------- |
| options       | 级联数据             | `CascaderOption<T>[]` | 是       | () => [] as CascaderOption[]                                                            |
| show          | 弹层显隐（v-model）  | `boolean`             | 是       | false                                                                                   |
| value         | 选中值（v-model）    | `T`                   | 否       | -                                                                                       |
| defaultValue  | 默认选中值（非受控） | `T`                   | 否       | -                                                                                       |
| title         | 标题文本             | `string`              | 否       | -                                                                                       |
| keys          | 字段映射配置         | `CascaderKeys`        | 否       | () => ({ label: 'label', value: 'value', children: 'children', disabled: 'disabled', }) |
| checkStrictly | 是否允许任意级别选中 | `boolean`             | 否       | false                                                                                   |
| placeholder   | 占位提示文字         | `string`              | 否       | '请选择'                                                                                |
| confirmText   | 确认按钮文字         | `string`              | 否       | '确定'                                                                                  |
| closeable     | 是否显示关闭按钮     | `boolean`             | 否       | true                                                                                    |
| customClass   | 自定义类名           | `string`              | 否       | -                                                                                       |
| customStyle   | 自定义样式           | `object`              | 否       | {}                                                                                      |

## Events

| 事件名       | 说明              | 参数                                                                    |
| ------------ | ----------------- | ----------------------------------------------------------------------- |
| change       | 值变更事件        | `value: { value: string \| number; selectedOptions: CascaderOption[] }` |
| pick         | 选项点击事件      | `value: string \| number, label: string, index: number, level: number`  |
| close        | 弹层关闭事件      | `value: { trigger: 'overlay' \| 'close-btn' \| 'finish' }`              |
| update:show  | 同步显示/隐藏状态 | `value: boolean`                                                        |
| update:value | 同步选中值        | `value: string \| number`                                               |

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
