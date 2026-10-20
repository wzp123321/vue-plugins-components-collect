---
title: Picker 选择器
lang: zh-CN
---

# Picker 选择器

Picker 选择器组件，用于一组预设数据中的选择、时间选择器。

## 基础用法

:::demo

mobile/picker/basic

:::

## Picker 属性

|  属性名  |                         类型                         |   默认值   |    说明    |
| :------: | :--------------------------------------------------: | :--------: | :--------: |
|   mode   | ^[enum]`selector、multiSelector、time、date、region` | 'selector' | 选择器模式 |
| disabled |                       Boolean                        |   false    |  是否禁用  |
| fileParamName |                       String                        |   files    |  使用内置文件上传时，自定义文件上传接口的key值  |
| imageSourceType |                       Array                        |   []    |  使用内置文件上传、type为all时，增加图片上传方式（拍照 or 从相册选取），参数同sourceType。如设置sourceType则使用sourceType  |
| videoSourceType |                       Array                        |   []    |  使用内置文件上传、type为all时，增加视频上传方式（拍摄视频 or 从相册选取），参数同sourceType。如设置sourceType则使用sourceType  |


## 日期选择器（mode = date）

| 属性名 |  类型  | 默认值 |                       说明                       |
| :----: | :----: | :----: | :----------------------------------------------: |
| value  | String |   0    |        表示选中的日期，格式为"YYYY-MM-DD"        |
| start  | String |        | 表示有效日期范围的开始，字符串格式为"YYYY-MM-DD" |
|  end   | String |        | 表示有效日期范围的结束，字符串格式为"YYYY-MM-DD" |

## 时间选择器（mode = time）

| 属性名 |  类型  | 默认值 |                          说明                          |
| :----: | :----: | :----: | :----------------------------------------------------: |
| value  | String |   0    |        表示选中的日期，格式为"YYYY-MM-DD hh:mm"        |
| start  | String |        | 表示有效日期范围的开始，字符串格式为"YYYY-MM-DD hh:mm" |
|  end   | String |        | 表示有效日期范围的结束，字符串格式为"YYYY-MM-DD hh:mm" |

## Picker 事件

| 事件名  |             说明             |             返回值              |
| :-----: | :--------------------------: | :-----------------------------: |
| @change | value 改变时触发 change 事件 | `event.detail = {value: value}` |
| @cancel |        取消选择时触发        |           `() => {}`            |
