# Search 组件

search 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          |     |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名                | 说明                                                                            | 类型    | 是否必填 | 默认值                     |
| --------------------- | ------------------------------------------------------------------------------- | ------- | -------- | -------------------------- |
| v-model:modelValue    | 搜索框值                                                                        | string  | 是       | -                          |
| placeholder           | 占位符                                                                          | string  | 否       | '请输入搜索关键词'         |
| clearable             | 是否显示清除按钮                                                                | boolean | 否       | true                       |
| disabled              | 是否禁用                                                                        | boolean | 否       | false                      |
| delay                 | 触发search事件的延迟时间，单位ms，默认不延迟,不延迟input和update:modelValue事件 | number  | 否       | 300                        |
| shape                 | 搜索框形状，可选值为round或rectangle                                            | string  | 否       | 'round'                    |
| bgColor               | 搜索框背景色模式，可选值为white或default                                        | string  | 否       | 'var(--tsm-color-primary)' |
| showFilterBtn         | 是否显示条件筛选按钮                                                            | boolean | 否       | true                       |
| filterBtnHasCondition | 条件筛选按钮是否设置了条件                                                      | boolean | 否       | false                      |
| customClass           | 自定义类名                                                                      | string  | 否       | -                          |
| customStyle           | 自定义样式                                                                      | object  | 否       | {}                         |

## 事件

| 事件名         | 说明                     | 参数   |
| -------------- | ------------------------ | ------ |
| search         | 搜索事件                 | string |
| input          | 输入事件                 | any    |
| clear          | 清除事件                 |        |
| confirm        | 软键盘点击完成按钮时触发 | any    |
| focus          | 获得焦点事件             | any    |
| blur           | 失去焦点事件             | any    |
| filterBtnClick | 点击条件筛选按钮事件     |        |
