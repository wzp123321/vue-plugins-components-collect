---
title: Segmented 分段控制器
lang: zh-CN
---

这是一个可以用于切换维度的分段控制器组件

## 基础用法

:::demo

te-segmented/basic

:::

## API

### 属性（props）

| 属性名      | 说明               | 类型   | 是否必要 | 默认值 |
| ----------- | ------------------ | ------ | -------- | ------ |
| v-model | 绑定值 | number \| string | 是       | ''    |
| dimensionOptions | 维度列表 | [{value: string \| number, text: string},...] | 是       | []    |
| theme | 主题 | light \| dark | 否       | light    |
| size | 尺寸 | small \| medium \| large | 否       | medium    |
| show-icon | 是否显示图标 | boolean | 否       | false    |

其余参数同：[RadioGroup Attributes](/zh-CN/component/radio.md#radiogroup-attributes)

### 事件（events）

同：[RadioGroup Events](/zh-CN/component/radio.md#radiogroup-events)
