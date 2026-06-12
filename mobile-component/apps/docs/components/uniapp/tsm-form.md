# Form 组件

form 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名                 | 说明                                                       | 类型                         | 是否必填 | 默认值 |
| ---------------------- | ---------------------------------------------------------- | ---------------------------- | -------- | ------ |
| model                  | 表单数据对象                                               | `Record<string, any>`        | 是       | -      |
| rules                  | 验证规则                                                   | `FormRules`                  | 否       | -      |
| errorMessage           | 错误消息模板                                               | `Record<string, string>`     | 否       | -      |
| labelAlign             | label 对齐方式                                             | `'left' \| 'right' \| 'top'` | 否       | -      |
| labelWidth             | label 宽度（px）                                           | `number`                     | 否       | -      |
| scrollToFirstError     | 验证失败时滚动到第一个错误：smooth-平滑滚动，auto-即时滚动 | `'' \| 'smooth' \| 'auto'`   | 否       | -      |
| showErrorMessage       | 是否显示错误信息                                           | `boolean`                    | 否       | -      |
| requiredMark           | 是否显示必填星号                                           | `boolean`                    | 否       | -      |
| requiredMarkPosition   | 必填星号位置：left-左侧，right-右侧                        | `'left' \| 'right'`          | 否       | -      |
| readonly               | 只读模式：禁止编辑，不触发验证                             | `boolean`                    | 否       | -      |
| requiredMarkOnReadonly | 只读模式下是否显示必填星号                                 | `boolean`                    | 否       | -      |
| customStyle            | 自定义样式                                                 | `Record<string, any>`        | 否       | -      |

## Events

| 事件名 | 说明     | 参数                                                                |
| ------ | -------- | ------------------------------------------------------------------- |
| submit | 提交事件 | `value: { validateResult: FormValidateResult; firstError: string }` |
| reset  | 重置事件 | `value: { formData: Record<string, any> }`                          |

## Slots

| 插槽名  | 说明                                     |
| ------- | ---------------------------------------- |
| default | 表单内容插槽，用于放置 FormItem 等表单项 |

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
