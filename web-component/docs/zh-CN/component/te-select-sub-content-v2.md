<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-06-13 15:23:09
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-07-08 15:04:41
 * @Description: 
-->
---
title: Select-v2 带子内容的选择器V2
lang: zh-CN
---

## 基础用法

:::demo

te-select-sub-content-v2/basic

:::

## API

### 属性（props）
  
| 属性名    | 说明     | 类型  | 是否必要 | 默认值                                        |
| --------- | -------- | ----- | -------- | --------------------------------------------- |
| data      | 选项列表 | array | 是       | 子内容字段值类型为string[]                                         |
| textProps | 展示字段名   | {}    | 否       | {mainText:  'mainText', subText:  'subText',valueKey:'id' }|
| filterKeysArr | 其他参与搜索的字段 | {} | 否 | 例如 ['code','deptName']
| highlightSubText | 是否高亮子内容 | boolean | 否 | true，需要showSubText为true
| showSubText | 是否展示子内容 | boolean | 否 | true
  
其余参数同：[Select 选择器](/zh-CN/component/select.md#select-attributes)

### 插槽（slots）

同：[Select 选择器](/zh-CN/component/select.md#select-slots)
