# Input 组件

基于[uni-app 原生 Input 组件](https://uniapp.dcloud.net.cn/component/input.html#type)，添加了自定义的属性和插槽。

## 属性说明

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          |     |

## 示例代码

<ExampleSourceCode />

## Props

[uni-app 原生 Input 组件](https://uniapp.dcloud.net.cn/component/input.html#type) 。
| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| ------------------ | ----------------------------------------------- | ------- | -------- | ------ |
| v-model:modelValue | 输入框的值，覆盖了uni内置的input组件的value属性 | string | 否 | - |
| disabled | 是否禁用 | boolean | 否 | false |
| readonly | 是否只读 | boolean | 否 | false |
| maxlength | 最大长度 | number | 否 | -1 |
| showWordimit | 是否显示最大长度提示 | boolean | 否 | false |
| clearable | 是否显示清除按钮 | boolean | 否 | false |
| tips | 提示信息 | string | 否 | - |
| customClass | 自定义类名 | string | 否 | - |
| customStyle | 自定义样式 | object | 否 | {} |

[uni-app 原生 Input 组件](https://uniapp.dcloud.net.cn/component/input.html#type) 。

## 事件

| 事件名  | 说明                     | 参数 |
| ------- | ------------------------ | ---- |
| input   | 输入事件                 | any  |
| clear   | 清除事件                 |      |
| confirm | 软键盘点击完成按钮时触发 | any  |
| focus   | 获得焦点事件             | any  |
| blur    | 失去焦点事件             | any  |

## 插槽

| 插槽名 | 说明     |
| ------ | -------- |
| prefix | 前缀插槽 |
| suffix | 后缀插槽 |
