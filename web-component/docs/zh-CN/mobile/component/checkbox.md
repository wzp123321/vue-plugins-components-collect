---
title: Checkbox 复选框
lang: zh-CN
---

# Checkbox 复选框

Checkbox 复选框组件，用于预设的一组选项中执行多项选择，并呈现选择结果。

## 基础用法

:::demo

mobile/checkbox/basic

:::

## Checkbox 属性

|  属性名  |  类型   | 默认值 |                                              说明                                               |
| :------: | :-----: | :----: | :---------------------------------------------------------------------------------------------: |
|  value   | String  |        | `<checkbox>` 标识，选中时触发 `<checkbox-group>` 的 change 事件，并携带 `<checkbox>` 的 value。 |
| disabled | Boolean | false  |                                            是否禁用                                             |
| checked  | Boolean | false  |                                当前是否选中，可用来设置默认选中                                 |

## CheckboxGroup 事件

| 事件名  |                        说明                        |                      返回值                      |
| :-----: | :------------------------------------------------: | :----------------------------------------------: |
| @change | `<checkbox-group>`中选中项发生改变是触发 change 事 | `detail = {value:[选中的checkbox的value的数组]}` |
