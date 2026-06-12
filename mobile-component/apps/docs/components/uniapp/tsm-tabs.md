# Tabs 组件

tabs 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名     | 说明                       | 类型         | 是否必填             | 默认值   |
| ---------- | -------------------------- | ------------ | -------------------- | -------- | --------- |
| list       | 标签列表                   | `TabItem[]`  | 否                   | () => [] |
| current    | 当前激活的标签索引         | `number`     | 否                   | 0        |
| duration   | 滑块移动动画时长           | `number`     | 否                   | 300      |
| scrollable | 是否可滚动                 | `boolean`    | 否                   | false    |
| isometric  | 是否等距布局, 默认false    | `boolean`    | 否                   | false    |
| keyName    | 从list元素对象中读取的键名 | `string`     | 否                   | 'name'   |
| size       | 尺寸 small                 | large        | `'small' \| 'large'` | 否       | 'large'   |
| itemType   | item样式类型：default 默认 | tag 标签样式 | `'default' \| 'tag'` | 否       | 'default' |

## Events

| 事件名     | 说明                 | 参数                        |
| ---------- | -------------------- | --------------------------- |
| change     | 切换标签页           | `[index: number]`           |
| click      | 点击标签页           | `[index: number]`           |
| update     | 更新当前激活的标签页 | `current': [value: number]` |
| list-click | 点击列表图标         | `-`                         |

## Slots

| 插槽名 | 说明 |
| ------ | ---- |
| item   | -    |

<style>
table {
  width: 100%;
  table-layout: fixed;
}
table th,
table td {
  word-break: break-all;
}
</style>
