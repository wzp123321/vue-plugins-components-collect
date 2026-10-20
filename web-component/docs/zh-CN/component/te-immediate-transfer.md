---
title: ImmediateTransfer 单向穿梭框
lang: zh-CN
---

## 待选支持多 Tabs

:::demo 使用`tabs`属性可以实现待选多 Tabs

te-immediate-transfer/basic

:::

## 待选支持多层级

:::demo `leftLevelTree` 插槽可以实现待选多层级

te-immediate-transfer/multiple-level

:::

## 待选支持虚拟树加载

:::demo 使用`isTreeV2` 属性可以实现待选虚拟树加载

te-immediate-transfer/virtualized-tree

:::

## API

### 属性（props）

| 属性名                | 说明                                                        | 类型                                                            | 是否必要 | 默认值 |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | -------- | ------ |
| model-value / v-model | 选中的集合                                                  | ^[Array]`元素类型同data数据源中的类型`                          | 是       | -      |
| defaultProps          | 字段映射，支持 disabled 配置                                | ^[Object]`{children: string, label: string, disabled?: string}` | 否       | -      |
| data                  | 列表数据源，同 [tree data](/zh-CN/component/tree.html#属性) | -                                                               | 否       | -      |
| treeTotal             | 列表总数                                                    | number                                                          | 是       | -      |
| maxLength             | 最多可选数量                                                | number                                                          | 否       | -      |
| showChooseAll         | 是否展示全选按钮                                            | boolean                                                         | 否       | true   |
| lazy                  | 同 [tree lazy](/zh-CN/component/tree.html#属性)             | boolean                                                         | -        | false  |
| load                  | 同 [tree load](/zh-CN/component/tree.html#属性)             | -                                                               | -        | -      |
| tabs                  | 左侧页签列表                                                | ^[Array]`{title: string, data: []}`                             | 否       | -      |
| leftSectionWidth      | 左侧区域宽度，可传 px 或者百分比                            | string                                                          | 否       | 50%    |
| strictlyProp          | 是否任选                                                    | boolean                                                         | 否       | true   |
| filterParentNode      | 已选是否过滤父节点                                          | boolean                                                         | 否       | false  |
| treeTitle             | 待选树标题                                                  | string                                                          | 否       | -      |
| showLeftTreeSearch    | 是否展示待选区搜索框                                        | boolean                                                         | 否       | true   |
| showRightTreeSearch   | 是否展示已选区搜索框                                        | boolean                                                         | 否       | true   |
| showLeftCount         | 是否显示待选数量                                            | boolean                                                         | 否       | true   |
| showHeadBgColor       | 是否显示头部背景色                                          | boolean                                                         | 否       | true   |
| showSwitchCheckMode   | 是否显示切换选择模式按钮                                    | boolean                                                         | 否       | false  |
| isTreeV2              | 待选是否用虚拟树加载                                        | boolean                                                         | 否       | false  |
| showParentTitle       | 是否显示已选列表中的上级标题                                | boolean                                                         | 否       | false  |
| namespace             | 命名空间，用于错误提示信息                                  | string                                                          | 否       | '对象' |
| nodeKey               | 数据源中每条数据唯一标识 key                                | string                                                          | 否       | 'id'   |
| defaultExpandAll      | 是否默认展开全部节点                                        | boolean                                                         | 否       | false  |
| expanedKeys           | 默认展开节点集合                                            | ^[Array]`number[]`                                              | 否       | []     |
| choosedProps          | 已选列表属性映射配置选项                                    | ^[Object]                                                       | 否       | -      |
| maxTags               | 最大显示标签数                                              | number                                                          | 否       | 2      |

### 事件（events）

| 事件名          | 说明           | 回调参数         |
| --------------- | -------------- | ---------------- |
| onLeftNodeClick | 待选树节点点击 | `{ data, node }` |
| onDeleteNode    | 删除已选节点   | `{ data }`       |
| onClearEvent    | 清空已选节点   | -                |

### 方法（method）

| 方法名             | 说明                 | 参数                                               |
| ------------------ | -------------------- | -------------------------------------------------- |
| updateCheckedNodes | 更新所有已选节点数据 | ^[Function]`(checkedNodes: Array<Object>) => void` |

### 插槽（slot）

| 插槽名        | 说明             | 子标签 |
| ------------- | ---------------- | ------ |
| leftLevelTree | 待选树多层级插槽 | ——     |

### te-immediate-transfer-tree-item 属性

| 属性名     | 说明           | 类型    | 是否必要 | 默认值 |
| ---------- | -------------- | ------- | -------- | ------ |
| treeTitle  | 待选树标题     | string  | 否       | -      |
| showSearch | 是否显示搜索框 | boolean | 否       | true   |
| isTreeV2   | 是否使用虚拟树 | boolean | 否       | false  |

其余属性同：[tree 属性](/zh-CN/component/tree.html#属性)

### te-immediate-transfer-tree-item 事件（events）

| 事件名     | 说明                                                  | 回调参数 |
| ---------- | ----------------------------------------------------- | -------- |
| check      | 同 [tree check](/zh-CN/component/tree.html#事件)      | -        |
| node-click | 同 [tree node-click](/zh-CN/component/tree.html#事件) | -        |
