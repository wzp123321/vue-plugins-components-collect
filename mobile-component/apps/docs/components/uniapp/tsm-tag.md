# Tag 组件

tag 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名     | 说明                                        | 类型                                                          | 是否必填 | 默认值    |
| ---------- | ------------------------------------------- | ------------------------------------------------------------- | -------- | --------- |
| selectable | 是否为可选中标签                            | `boolean`                                                     | 否       | false     |
| selectType | 可选中标签类型                              | `'input' \| 'select'`                                         | 否       | 'select'  |
| type       | 标签类型                                    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | 否       | 'default' |
| size       | 标签大小                                    | `'small' \| 'medium' \| 'large'`                              | 否       | 'medium'  |
| shape      | 标签形状 默认 square，可选 bubble，对应气泡 | `'square' \| 'bubble'`                                        | 否       | 'square'  |
| text       | 标签文字                                    | `string`                                                      | 否       | -         |
| value      | 可操作标签唯一标识                          | `string \| number \| null`                                    | 否       | -         |
| label      | select 类型中间展示文本                     | `string`                                                      | 否       | -         |
| selected   | select 类型选中状态                         | `boolean`                                                     | 否       | false     |
| disabled   | 是否禁用                                    | `boolean`                                                     | 否       | false     |
| closable   | 是否可关闭                                  | `boolean`                                                     | 否       | false     |
| borderless | 是否显示边框                                | `boolean`                                                     | 否       | false     |

## Events

| 事件名 | 说明               | 参数 |
| ------ | ------------------ | ---- |
| click  | 点击标签时触发     | `-`  |
| close  | 点击关闭按钮时触发 | `-`  |
| change | 标签状态变化时触发 | `[   |

    {
      selected: boolean;
      value: string \| number \| null \| undefined;
      label: string \| undefined;
      selectType: 'input' \| 'select';
    },

]`|
| update | 更新选中状态 |`selected': [value: boolean]`|
| update | 更新绑定值 |`value': [value: string \| number \| null]` |

## Slots

| 插槽名  | 说明 |
| ------- | ---- |
| icon    | -    |
| default | -    |
| default | -    |
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
