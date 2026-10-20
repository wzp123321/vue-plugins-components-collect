---
title: 树结构编辑布局
lang: zh-CN
---

## 基础用法

:::demo

te-layout-tree/basic

:::

与 te-tree-edit 结合使用

### Attributes

| 参数             | 说明                                    | 类型    | 可选值 | 默认值         |
| ---------------- | --------------------------------------- | ------- | ------ | -------------- |
| show-side-expand | 整体折叠收缩按钮                        | boolean |        | true           |
| title            | 标题                                    | string  | 文字   | 类别           |
| show-add-btn     | 右上角新增按钮                          | boolean |        | true           |
| placeholder      | 输入框描述                              | string  | 文字   | '请输入关键字' |
| all-expand-btn   | 全部展开                                | boolean |        | true           |
| level-expand-btn | 第 n 级展开                             | boolean |        | true           |
| tree-data        | tree 的数据源，用于生成 1- n 级展开菜单 |         |        | []             |
| children-name    | tree 的数据源里，children 的自定义别名  |         |        | children       |

继承[Search 搜索框](/zh-CN/component/te-search.md#attributes)所有属性

### Slots

| 插槽名        | 说明                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| header        | 左侧头部插槽，位于 title 下方                                                                       |
| content       | 请插入 te-tree-edit 组件,插槽作用域传参`{searchValue:string, allExpand:boolean,levelExpand:string}` |
| add-plus      | 右上角加号位置的插槽                                                                                |
| right-content | 右侧内容插槽                                                                                        |

### Events

| 事件名称          | 说明                                    | 类型     |
| ----------------- | --------------------------------------- | -------- |
| inputSearch       | 触发搜索，携带搜索框的值                | Function |
| addItem           | 点击新增按钮                            | Function |
| handleAllExpand   | 全部层级展开/折叠，入参为 boolean       | Function |
| handleLevelExpand | 指定层级展开/折叠，入参为层级数，string | Function |

### 方法

| 事件名称    | 说明               | 类型     |
| ----------- | ------------------ | -------- |
| clearSearch | 用于清空搜索框内容 | Function |

## 子组件 te-tree-edit

##### ！必须将作用域{searchValue:string, allExpand:boolean,levelExpand:string}传给子组件，全部展开，层级展开，自动搜索方可生效，详情查看上方 demo 代码

##### 若需要控制 te-tree-edit 内部的 te-tree，可使用 ref.value.$refs.treeRef

### Attributes

| 参数           | 说明                           | 类型 | 可选值 | 默认值 |
| -------------- | ------------------------------ | ---- | ------ | ------ |
| props          | 同 te-tree，新增了 notShowMore |      | 必填项 | 见下表 |
| searchValue    | 搜索值，自动过滤树             |      |        |        |
| 其余同 te-tree |                                |      |        |        |

### props Attributes

| 参数        | 说明                                                     | 类型                         | 可选值 | 默认值        |
| ----------- | -------------------------------------------------------- | ---------------------------- | ------ | ------------- |
| notShowMore | 指定是否展示三个点为节点对象的某个属性值(boolean)        | string                       | 必填   | 'notShowMore' |
| label       | 指定节点标签为节点对象的某个属性值                       | string, function(data, node) |        |               |
| children    | 指定子树为节点对象的某个属性值                           | string                       |        |               |
| disabled    | 指定节点选择框是否禁用为节点对象的某个属性值             | string, function(data, node) |        |               |
| isLeaf      | 指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效 | string, function(data, node) |        |               |
| class       | 自定义节点类名                                           | string, function(data, node) |        |               |

和 te-tree 相同

### Slots

| 插槽名      | 说明                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| more-action | ...触发的更多操作，需使用 te-dropdown-menu 包裹的下拉选项，作用域传参`{node,data}` |
| item-icon   | 文件夹图标插槽，作用域传参`{node,data}`                                            |

### Events

| 事件名称 | 说明 | 类型 |
| -------- | ---- | ---- |

更多属性和方法参考
：[Tree 树形控件](/zh-CN/component/tree.md#%E6%96%B9%E6%B3%95)
