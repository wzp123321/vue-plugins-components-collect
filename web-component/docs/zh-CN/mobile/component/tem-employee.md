---
title: 员工选择
lang: zh-CN
---

## 基础用法

使用的 mock 接口数据，数据展示不准确

:::demo

mobile/tem-employee/index

:::

## API

### 属性（props）

| 属性名              | 说明                                           | 类型    | 是否必要 | 默认值   |
| ------------------- | ---------------------------------------------- | ------- | -------- | -------- |
| v-model:selected    | 选中员工：[{ id:xxx,...}]                      | array   | 是       | -        |
| http                | Request 实例                                   | Request | 是       | -        |
| tenant-id           | tenantId                                       | string  | 是       | -        |
| organizationId      | 组织 id                                        | string  | 否       | -        |
| title               | 顶部标题                                       | string  | 否       | 选择人员 |
| multiple            | 是否多选                                       | boolean | 否       | false    |
| multiple-limit      | 多选场景下最多可以选择的项目数                 | number  | 否       | Infinity |
| history-storage-key | 历史选择缓存的 key，有值时搜索时会展示历史选择 | string  | 否       | -        |
| history-num-limit   | 历史选择展示数量                               | number  | 否       | 8        |

## 方法

| 方法称名 | 说明 | 参数 |
| -------- | ---- | ---- |
| open     | 打开 | -    |
| close    | 关闭 | -    |
