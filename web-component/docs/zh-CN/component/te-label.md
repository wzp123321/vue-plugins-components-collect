---
title: 标签选择
lang: zh-CN
---

## 单选

:::demo

te-label/single

:::

## 多选

:::demo

te-label/multiple

:::

## API

### 属性（props）

| 属性名           | 说明                                     | 类型    | 是否必要 | 默认值 |
| ---------------- | ---------------------------------------- | ------- | -------- | ------ |
| v-model:visible  | 弹窗是否显示                             | boolean | 是       | false  |
| v-model:selected | 选中标签：[{ id:xxx,...}]                | array   | 是       | -      |
| axiosInstance    | axios 实例                               | axios   | 是       | -      |
| tenantId         | tenantId                                 | string  | 是       | -      |
| organizationId   | 组织 id                                  | string  | 否       | -      |
| multiple         | 是否多选                                 | boolean | 否       | false  |
| multiple-limit   | 多选场景下最多可以选择的项目数，最大 500 | number  | 否       | 500    |
