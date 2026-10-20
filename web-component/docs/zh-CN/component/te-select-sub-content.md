---
title: Select 选择器
lang: zh-CN
---

## 基础用法

:::demo

te-select-sub-content/basic

:::

## API

### 属性（props）

| 属性名           | 说明                   | 类型    | 是否必要 | 默认值                                                            |
| ---------------- | ---------------------- | ------- | -------- | ----------------------------------------------------------------- |
| selectOptions    | 选项列表               | array   | 是       | 无                                                                |
| highlightSubText | 副标题是否参与搜索高亮 | boolean | 否       | true                                                              |
| propsMap         | 选项列表取值字段映射   | object  | 否       | ^[object]`{ id: 'id', label: 'label', subTextArr: 'subTextArr' }` |
| renderAll        | 是否渲染所有数据       | boolean | 否       | false                                                             |

其余参数同：[Select 选择器](/zh-CN/component/select.md#select-attributes)

### 插槽（slots）

同：[Select 选择器](/zh-CN/component/select.md#select-slots)

### 事件（events）

| 事件名       | 说明               | 接受参数 |
| ------------ | ------------------ | -------- |
| remoteMethod | 自定义远程搜索方法 | 无       |
