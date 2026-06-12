# Avatar 组件

avatar 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                  | 类型                                                | 是否必填 | 默认值    |
| ----------- | ------------------------------------- | --------------------------------------------------- | -------- | --------- |
| type        | 头像类型                              | `'picture' \| 'icon' \| 'text'`                     | 否       | 'picture' |
| property    | icon 类型头像属性，当type为icon时生效 | `'user' \| 'organization' \| 'group' \| 'material'` | 否       | 'user'    |
| text        | 头像文本内容                          | `string`                                            | 否       | -         |
| src         | 头像图片地址，当type为picture时生效   | `string`                                            | 否       | -         |
| size        | 头像大小                              | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'`                 | 否       | 'm'       |
| bgColor     | 背景颜色                              | `string`                                            | 否       | -         |
| color       | 文字颜色                              | `string`                                            | 否       | -         |
| borderColor | 边框颜色                              | `string`                                            | 否       | -         |

## Slots

| 插槽名 | 说明 |
| ------ | ---- |
| icon   | -    |
| text   | -    |

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
