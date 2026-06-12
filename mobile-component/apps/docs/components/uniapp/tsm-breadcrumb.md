# Breadcrumb 组件

breadcrumb 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名    | 说明                           | 类型                  | 是否必填 | 默认值 |
| --------- | ------------------------------ | --------------------- | -------- | ------ |
| separator | 自定义分隔符，支持字符串或组件 | `string \| Component` | 否       | -      |

## Slots

| 插槽名  | 说明                                                     |
| ------- | -------------------------------------------------------- |
| default | 插槽：default - 面包屑项列表（tsm-breadcrumb-item 组件） |

## 关联组件

### Breadcrumb-item 组件

breadcrumb-item 组件的描述信息

#### Props

| 属性名       | 说明                                 | 类型              | 是否必填 | 默认值 |
| ------------ | ------------------------------------ | ----------------- | -------- | ------ |
| item         | 单项数据                             | BreadcrumbItem    | 否       | {}     |
| label        | 文本内容                             | string            | 否       | -      |
| ellipsisMode | 文本超长省略方式：中间省略或末尾省略 | 'middle' \| 'end' | 否       | 'end'  |
| showItemIcon | 是否显示单项前置图标                 | boolean           | 否       | true   |

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
