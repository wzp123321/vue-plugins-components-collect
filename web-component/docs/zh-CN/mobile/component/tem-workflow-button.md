---
title: 工作流-按钮
lang: zh-CN
---

## 使用在任务详情页

:::demo

mobile/tem-workflow-button/button-detail

:::


## API

### 属性（props）

| 参数名            | 参数类型                                   | 是否必填 | 说明|
| ------------------| ----------------------------------------- | -------- | ---- |
| tenantId          | String                                     | Y        | 租户 id |
| http              | Request                                     | Y        | Request 实例，把项目中用于发请求的 Request 对象传进来即可。这样组件里面发的请求就会走项目中的拦截器 |
| taskInstanceId    | string                                     | Y        | 任务实例 id,作为执行人时，必须传入 taskInstanceId  |
| processInstanceId | string                                     | Y        | 流程实例 id，作为发起人时，必须传入 processInstanceId |
| identityType      | string[]                                   | N        | 身份类型，可以是执行人(TODO)、发起人(STARTER)。默认为执行人 |
| useScene          | String                                     | N        | 使用场景，根据使用场景不通，按钮渲染的样式会不一样。list-使用在列表页面， detail-使用再详情页，默认是detail|
| order             | String                                     | N        | 按钮渲染顺序,left-right :从左往右渲染， right-left 从右往左渲染 ，默认是 right-left |
| extraButtons      | [{name:'查看',code:'xxx',style:'primary'}] | N        | 业务自定义的非流程按钮，组件内帮助渲染(渲染在流程按钮之前) |
| backExtraButtons      | [{name:'查看',code:'xxx',style:'primary'}] | N        | 业务自定义的非流程按钮，组件内帮助渲染(渲染在流程按钮之后) |
| reloadFlag        | string \| number                           | N        | 刷新标识,此值变更时，组件内部会重新调用获取按钮的接口来刷新按钮，注意不要频繁变更此值|
| terminalId        | string                                     | N        | 当前的终端 id 参考[业务终端清单](https://team.tiansu-china.com:10134/tiansu/TS-PRODUCT/proxima/boards/82e5ea9b-6b77-46c3-ab1e-5d8ec17365c5?component=Default&view=E570zZ2PyX)中定义的终端编码 |
| unSuppertedMode   | string                                     | N        | 按钮不可用时的配置：hidden=默认值，隐藏按钮；visible=直接显示按钮，点击后交由业务侧去执行；tip=点击弹窗一个固定提示语，不再交由业务侧执行。不可用判定：按钮关联了界面动作，且界面动作中的 jumpInfos 所支持的终端 id 不包含当前终端 id。 需要 terminalId 参数不为空，terminalId 不传判定为可用 |
| asWorkflowButton  | boolean                                    | N        | 是否是作为流程按钮组件使用，如果是则获取流程按钮，不是则只渲染extraButtons和backExtraButtons 传进来的按钮，默认为 true。|

### 事件（events）

| 事件名 | 说明                                | 接受参数                                                                                             |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| click  | 注册的页面事件监听，button:配置信息 | (button:{processAction:{},uiAction:{code:'业务能识别的 code'},businessAction:{}},$event:Event)=>void |

### 方法(Expose，通过 ref 调用)

| 方法名 | 说明     | 接受参数 |
| ------ | -------- | -------- |
| reload | 重载按钮 | ()=>void |
