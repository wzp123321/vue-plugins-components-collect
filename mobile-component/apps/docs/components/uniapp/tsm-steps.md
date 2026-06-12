# Steps 组件

steps 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明             | 类型                       | 是否必填 | 默认值       |
| ----------- | ---------------- | -------------------------- | -------- | ------------ |
| current     | 当前步骤         | number                     | 否       | 0            |
| direction   | 步骤条方向       | 'horizontal' \| 'vertical' | 否       | 'horizontal' |
| simple      | 是否显示简洁风格 | boolean                    | 否       | false        |
| customClass | 自定义类名       | string                     | 否       | -            |
| customStyle | 自定义样式       | object                     | 否       | {}           |

## 插槽

| 插槽名  | 说明                              |
| ------- | --------------------------------- |
| default | 必须使用StepsItem组件作为插槽内容 |

## Steps-item 子组件

| 属性名      | 说明       | 类型   | 是否必填 | 默认值 |
| ----------- | ---------- | ------ | -------- | ------ |
| title       | 步骤标题   | string | 否       | -      |
| description | 步骤描述   | string | 否       | -      |
| icon        | 步骤图标   | string | 否       | -      |
| customClass | 自定义类名 | string | 否       | -      |
| customStyle | 自定义样式 | object | 否       | {}     |
