---
title: 空间选择组件
lang: zh-CN
---

## 单选可搜索

### mock 数据，仅支持搜 2

:::demo

space-select/single

:::

## 多选可搜索

:::demo

space-select/multiple

:::

## 指定可选择的层级

:::demo

space-select/basic

:::

## 编辑回显

:::demo

space-select/edit

:::

## 选中项是否展示全路径

:::demo

space-select/show-all-level

:::

## API

### 属性（props）

| 属性名                  | 说明                                              | 类型                          | 是否必要 | 默认值                                                                                            |
| ----------------------- | ------------------------------------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| allow-select-all-levels | 允许选择的层级                                    | object                        | 否       | `{campus:true,building:true,buildingPart:true,floor:true,floorPart:true,room:true,roomPart:true}` |
| multiple                | 是否开启多选                                      | boolean                       | 否       | false                                                                                             |
| show-all-levels         | 选中项展示全路径或最后一级                        | boolean                       | 否       | true                                                                                              |
| max-collapse-tags       | 需要显示的 Tag 的最大数量                         | number                        | 否       | 1                                                                                                 |
| show-all-levels         | 选中项展示全路径或最后一级                        | boolean                       | 否       | true                                                                                              |
| model-value / v-model   | 选中的值                                          | string[] / { id:xxx }[]       | 否       | 无                                                                                                |
| value-type              | value 类型，为 object 时 model-value 返回对象数组 | ^[enum]`'string' \| 'object'` | 否       | 'string'                                                                                          |
| axios                   | 封装了 header 头和拦截方法的 axios 实例           | class                         | 是       | 无                                                                                                |
| tenantId                | 租户 id                                           | string                        | 是       | 无                                                                                                |
| campusIds               | 仅显示此院区列表下的数据                          | string[]                      | 否       | true                                                                                              |

### 插槽（slots）

| 插槽名 | 说明 | 作用域 |
| ------ | ---- | ------ |
| 无     | 无   | 无     |

### 事件（events）

| 事件名 | 说明 | 接受参数 |
| ------ | ---- | -------- |
| 无     | 无   | 无       |
