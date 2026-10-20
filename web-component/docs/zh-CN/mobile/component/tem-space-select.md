---
title: 空间选择组件
lang: zh-CN
---

## 基础用法

使用的 mock 接口数据，数据展示不准确

:::demo

mobile/tem-space-select/index

:::

## API

### 属性（props）

| 属性名                  | 说明                     | 类型                                     | 是否必要 | 默认值                                                                                            |
| ----------------------- | ------------------------ | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| allow-select-all-levels | 允许选择的层级           | object                                   | 否       | `{campus:true,building:true,buildingPart:true,floor:true,floorPart:true,room:true,roomPart:true}` |
| multiple                | 是否开启多选             | boolean                                  | 否       | false                                                                                             |
| model-value / v-model   | 选中的值                 | { id:xxx }[ ]                            | 否       | -                                                                                                 |
| http                    | Request 实例             | Request                                  | 是       | -                                                                                                 |
| tenant-id               | 租户 id                  | string                                   | 是       | -                                                                                                 |
| campus-ids              | 仅显示此院区列表下的数据 | string[]                                 | 否       | [ ]                                                                                               |
| hide-from-level         | 从该级别开始隐藏后续节点 | ^[enum]`'building' \| 'floor' \| 'room'` | 否       | -                                                                                                 |
| title                   | 顶部标题                 | string                                   | 否       | 选择空间                                                                                          |

## 方法

| 方法称名 | 说明 | 参数 |
| -------- | ---- | ---- |
| open     | 打开 | -    |
| close    | 关闭 | -    |
