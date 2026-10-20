---
title: 空间属性选择
lang: zh-CN
---

空间属性选择组件，第一层不可选择，组件其余属性同 te-tree-select

## 单选

:::demo

te-space-attribute/single

:::

## 多选

:::demo

te-space-attribute/multiple

:::

## API

### 属性（props）

| 属性名                | 说明                              | 类型              | 是否必要 | 默认值 |
| --------------------- | --------------------------------- | ----------------- | -------- | ------ |
| model-value / v-model | 选中值，单选 sting，多选 string[] | string / string[] | 是       | -      |
| axios                 | axios 实例                        | axios             | 是       | -      |
| tenantId              | 租户 id                           | string            | 是       | -      |
| multiple              | 是否多选                          | boolean           | 否       | false  |
