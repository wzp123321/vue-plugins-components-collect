# Rate 组件

rate 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                | 类型    | 是否必填 | 默认值 |
| ----------- | ------------------- | ------- | -------- | ------ |
| value       | 当前评分值（5分制） | number  | 否       | 0      |
| disabled    | 是否禁用            | boolean | 否       | false  |
| customClass | 自定义类名          | string  | 否       | -      |
| customStyle | 自定义样式          | object  | 否       | {}     |

## Events

| 事件名       | 说明               | 参数          |
| ------------ | ------------------ | ------------- |
| change       | 评分变化时触发     | value: number |
| update:value | v-model 绑定值更新 | value: number |

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
