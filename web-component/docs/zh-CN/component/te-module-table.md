---
title: ModuleTable 表格组件
lang: zh-CN
---

这是一个带分页、列自定义、筛选功能表格组件

## 基础用法

:::demo

te-module-table/basic

:::

## API

### 属性（props）

| 属性名                    | 说明                                                                 | 类型                     | 是否必要 | 默认值 |
| ------------------------- | -------------------------------------------------------------------- | ------------------------ | -------- | ------ |
| columns                   | 静态 column 数据，若存在则不使用 requestColumnApi 返回的 column 数据 | columnProps[]            | 否       | []     |
| dynamicColumns            | 动态配置列                                                           | columnProps[]            | 否       | []     |
| data                      | 静态表格数据，若存在则不使用 requestApi 返回的 data 数据             | []                       | 否       | []     |
| requestApi                | 请求表格数据的 api                                                   | (params: any) => Promise | 否       | null   |
| initParam                 | 初始请求参数                                                         | any                      | 否       | {}     |
| requestAuto               | 是否自动执行请求                                                     | boolean                  | 否       | true   |
| requestError              | 表格 api 请求错误监听                                                | (params: any) => void    | 否       | null   |
| dataCallback              | 表格 data 的回调函数，可对数据进行处理                               | (data: any) => any       | 否       | null   |
| pagination                | 是否需要分页                                                         | boolean                  | 否       | true   |
| isPageParam               | 是否分页入参为 page 对象                                             | boolean                  | 否       | false  |
| pageSavaApi               | 保存表格分页配置的 api                                               | (params: any) => Promise | 否       | null   |
| requestColumnApi          | 请求表格配置的 api                                                   | (params: any) => Promise | 否       | null   |
| initColumnParam           | 初始请求表格配置的参数                                               | any                      | 否       | {}     |
| requestColumnError        | 表格配置 api 请求错误监听                                            | (params: any) => void    | 否       | null   |
| columnCallback            | 表格配置的回调函数，可对数据进行处理                                 | (data: any) => any       | 否       | null   |
| indexName                 | 自定义序号 label                                                     | string                   | 否       |        |
| stripe                    | 是否显示斑马纹                                                       | boolean                  | 否       | true   |
| border                    | 是否显示边框                                                         | boolean                  | 否       | true   |
| rowKey                    | 行数据的 Key，用来优化 Table 的渲染，当表格数据多选时，所指定的 id   | string                   | 否       | id     |
| border                    | 是否显示边框                                                         | boolean                  | 否       | true   |
| showIndexColumn           | 是否显示索引列                                                       | boolean                  | 否       | true   |
| showSelectColumn          | 是否显示全选列                                                       | boolean                  | 否       | true   |
| showOperationColumn       | 是否显示操作列                                                       | boolean                  | 否       | true   |
| showExpandColumn          | 是否显示展开列                                                       | boolean                  | 否       | false  |
| selectIdList              | 选中数据的 idList                                                    | string[]                 | 否       | []     |
| is-flex                   | 表格是否响应式，默认为 false 表格最大高度为 480px                    | boolean                  | 否       | false  |
| showOperationColumnSpread | 是否显示操作列折叠按钮                                               | boolean                  | 否       | false  |

其余参数同[TeTable 属性](/zh-CN/component/table.md#table-%E5%B1%9E%E6%80%A7)

### 方法（method）

tableRef 可以调用的方法
| 方法名 | 说明 | 参数 |
| ----------- | ------------------ | -------- |
| query | 执行查询操作，跳到第 1 页 | —— |
| reset | 重置所有参数，跳到第 1 页 | —— |
| getTableList | 查询列表，不修改参数 | —— |

其他方法同[TeTable 方法](/zh-CN/component/table.md#table-%E6%96%B9%E6%B3%95)

### 事件（events）

| 事件名           | 说明           | 回调参数   |
| ---------------- | -------------- | ---------- |
| selection-change | 选中列发生变化 | selectRows |

其他事件同[TeTable 事件](/zh-CN/component/table.md#table-%E4%BA%8B%E4%BB%B6)

### 插槽（slot）

| 插槽名                            | 说明                       | 子标签 |
| --------------------------------- | -------------------------- | ------ |
| operation                         | 自定义操作列，可放置按钮组 | ——     |
| tablePropName(动态)               | 自定义表格列               | ——     |
| expand-default                    | 展开列表默认插槽           | ——     |
| [tablePropName(动态)]-title-suffi | 自定义列表头名称后插槽     | ——     |

其他插槽同[TeTable 插槽](/zh-CN/component/table.md#table-%E6%8F%92%E6%A7%BD)

## 子组件

### TeTableButtonGroup

#### 属性（props）

| 属性名      | 说明     | 类型         | 是否必要 | 默认值 |
| ----------- | -------- | ------------ | -------- | ------ |
| row         | 行数据   | any          | 否       | null   |
| tableButton | 表格按钮 | ButtonType[] | 否       | []     |

```js
ButtonType: {
	buttonName: string; // 按钮名称
	buttonColor: string; // 按钮颜色
	value: string; // 按钮标识 如add、view、edit...
	showBtnPop: true, // 是否需要二次确认弹唱
	pop: {
			cancel: '取消',// 取消按钮文案
			confirm: '确认',// 确认按钮文案
			tip: '该数据将无法恢复，确定要删除吗？'// 提示文本
		} // showBtnPop为true时生效
}
```

#### 事件（events）

| 方法名  | 说明           | 回调参数                            |
| ------- | -------------- | ----------------------------------- |
| operate | 点击按钮时触发 | `{ row: 行数据, value: 按钮value }` |
