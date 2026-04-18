# Empty 组件

empty 组件的描述信息

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名      | 说明                                                                                                                                                             | 类型    | 是否必填 | 默认值   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | -------- |
| scene       | 使用场景,block：区块场景，page：页面场景；block场景下支持支type为noData，noSearch，noAuthority                                                                   | string  | 否       | 'page'   |
| type        | 空类型：noData:无数据，noInternet:无网络，noSearch:无搜索结果，noAuthority:无权限，loadingError:加载失败，noMessage:无消息，noImage:无图片，successTips:成功提示 | string  | 否       | 'noData' |
| isIcon      | 是否显示图标,block场景下支持,page场景下固定显示图标                                                                                                              | boolean | 否       | true     |
| title       | 提示文字,page场景下支持                                                                                                                                          | string  | 否       | -        |
| description | 描述                                                                                                                                                             | string  | 否       | -        |
| buttonText  | 按钮文字,空不显示按钮；page场景下支持                                                                                                                            | string  | 否       | -        |
| customClass | 自定义类名                                                                                                                                                       | string  | 否       | -        |
| customStyle | 自定义样式                                                                                                                                                       | object  | 否       | {}       |

## 事件

| 事件名   | 说明         | 参数 | 返回值 |
| -------- | ------------ | ---- | ------ |
| btnClick | 点击按钮事件 | 无   | 无     |
