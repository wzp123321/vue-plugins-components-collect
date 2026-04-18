# Popup 组件

popup 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名              | 说明                 | 类型                                   | 是否必填 | 默认值   |
| ------------------- | -------------------- | -------------------------------------- | -------- | -------- |
| show                | 是否显示弹窗         | boolean                                | 是       | false    |
| title               | 弹窗标题             | string                                 | 否       | -        |
| overlay             | 是否显示遮罩         | boolean                                | 否       | true     |
| mode                | 弹出方向             | 'top' \| 'bottom' \| 'left' \| 'right' | 否       | 'bottom' |
| closeable           | 是否显示关闭图标     | boolean                                | 否       | false    |
| closeOnClickOverlay | 点击遮罩是否关闭弹窗 | boolean                                | 否       | true     |
| zIndex              | 层级                 | number                                 | 否       | 10075    |
| round               | 圆角值               | number                                 | 否       | 0        |
| customClass         | 自定义类名           | string                                 | 否       | -        |
| customStyle         | 自定义样式           | object                                 | 否       | {}       |

## Events

| 事件名 | 说明         | 参数 |
| ------ | ------------ | ---- |
| open   | 弹窗打开事件 | -    |
| close  | 弹窗关闭事件 | -    |

## 插槽

| 插槽名  | 说明                                   |
| ------- | -------------------------------------- |
| default | 弹窗内容插槽                           |
| header  | 弹窗标题插槽，mode=bottom时生效        |
| footer  | 弹窗底部插槽，mode=bottom \| top时生效 |

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
