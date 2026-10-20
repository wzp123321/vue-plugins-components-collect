---
title: 工作流-基本信息
lang: zh-CN
---

## 基础用法

:::demo

te-workflow-baseinfo/baseinfo

:::

## API

### 属性（props）

| 参数名            | 参数类型 | 是否必填 | 说明                                                                                                                  |
| ----------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| tenantId          | String   | Y        | 租户 id                                                                                                               |
| axios             | axios    | Y        | axios 实例，把项目中用于发请求的 axios 对象传进来即可。这样组件里面发的请求就会走项目中的拦截器                       |
| taskInstanceId    | string   | Y        | 任务实例 id,taskInstanceId 可通过平台的/hlms/openapi/workflowv2/v1/${tenantId}/task/queryTaskDetailForList 接口获取。 |
| processInstanceId | string   | Y        | 流程实例 id 时，                                                                                                      |
