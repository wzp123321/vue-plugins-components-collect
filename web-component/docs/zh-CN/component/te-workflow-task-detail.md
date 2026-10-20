---
title: 工作流-任务详情
lang: zh-CN
---

## 基础用法

:::demo

te-workflow-task-detail/task-detail

:::

## 以函数的方式打开

:::demo

te-workflow-task-detail/util

:::

## API

### 基础用法的属性（props）

| 参数名            | 参数类型 | 是否必填 | 说明                                                                                                                  |
| ----------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| tenantId          | String   | Y        | 租户 id                                                                                                               |
| axios             | axios    | Y        | axios 实例，把项目中用于发请求的 axios 对象传进来即可。这样组件里面发的请求就会走项目中的拦截器                       |
| taskInstanceId    | string   | Y        | 任务实例 id,taskInstanceId 可通过平台的/hlms/openapi/workflowv2/v1/${tenantId}/task/queryTaskDetailForList 接口获取。 |
| processInstanceId | string   | Y        | 流程实例 id                                                                                                           |
| identityType      | string[] | N        | 身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人                            |

### 事件（events）

| 事件名  | 说明                       | 接受参数                                          |
| ------- | -------------------------- | ------------------------------------------------- |
| confirm | 流程操作成功并关闭窗口     | (data:{errcode:'0',data:any,errmsg:string})=>void |
| cancle  | 取消按钮或空白处来关闭窗口 | (errmsg:string)=>void                             |

### 以函数的方式打开-函数定义

TeWorkflowUtil.openTaskDetail(tenantId,taskInstanceId,processInstanceId,axios,customPageDefinition,identityType,appendTo)

| 参数名               | 参数类型                             | 是否必填 | 说明                                                                                                                                                                                                         |
| -------------------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tenantId             | String                               | Y        | 租户 id                                                                                                                                                                                                      |
| taskInstanceId       | string                               | Y        | 任务实例 id,taskInstanceId 可通过平台的/hlms/openapi/workflowv2/v1/${tenantId}/task/queryTaskDetailForList 接口获取。                                                                                        |
| processInstanceId    | string                               | Y        | 流程实例 id processInstanceId                                                                                                                                                                                |
| axios                | axios                                | Y        | axios 实例，把项目中用于发请求的 axios 对象传进来即可。这样组件里面发的请求就会走项目中的拦截器                                                                                                              |
| CustomPageDefinition | ([{openType:string,jumpUrl:string}]) | N        | 注册的 CustomPageDefinition，openType ：POPUP-以弹窗的方式打开'jumpUrl'页面，COMPONENT-调用平台组件                                                                                                          |
| identityType         | string[]                             | N        | 身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人                                                                                                                   |
| appendTo             | string\|HtmlElement                  | N        | dom 对象或容器 id，当用的是平台提供的任务详情组件，且此参数传了有效值，就会把任务详情组件渲染到该 dom 对象中，不传会把任务详情组件渲染到 body 元素下，传了无效值会报错。当用的是业务的任务详情页面时，就不传 |
| return               | Promise                              | N        | 返回值，返回一个 promise 对象,resove 状态对应流程操作成功并关闭窗口 ，reject 状态对应点击取消按钮或空白处来关闭窗口                                                                                          |
