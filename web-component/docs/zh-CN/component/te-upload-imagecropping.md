---
title: 图片上传组件，卡片形式展示
lang: zh-CN
---

# 图片上传组件，卡片形式展示

## 基础用法

:::demo

te-upload-imagecropping/basic

:::

## API

### 属性（props）

| 属性名            | 说明                                                                                            | 类型                                                         | 是否必要 | 默认值                      |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------- | --------------------------- |
| axios             | axios 实例，把项目中用于发请求的 axios 对象传进来即可。这样组件里面发的请求就会走项目中的拦截器 | AxiosInstance                                                | 否       |                             |
| action            | 上传的接口，只支持 post                                                                         | string                                                       | 是       | /hlms/api/tenant/nfs/upload |
| data              | 上传接口的参数，若 action 不传，则必须传入 tenantId 参数                                        | {}                                                           | 否       | {}                          |
| headers           | 请求头                                                                                          | {}                                                           | 否       |
| on-before-upload  | 上传前的回调,返回 true 继续上传，返回 false 终止上传                                            | (file: File) => boolean                                      | 否       |                             |
| on-success        | 成功上传时的回调，回调函数的 response 参数即为接口返回的值                                      | (response: any, imgList: string[]) => void                   | 否       |                             |
| on-error          | 上传失败时的回调                                                                                | (response: any, imgList: string[]) => void                   | 否       |                             |
| v-model:file-list | 上传的图片列表值                                                                                | string[]                                                     | 是       |                             |
| limit             | 允许上传文件的最大数量                                                                          | number                                                       | 否       | 1                           |
| width             | 卡片的宽                                                                                        | number                                                       | 否       | 145                         |
| height            | 卡片的高                                                                                        | number                                                       | 否       | 145                         |
| is-cropper        | 是否启用截图                                                                                    | boolean                                                      | 否       | true                        |
| fixed-number      | 截图固定的宽高比,不传则截图框不固定比例                                                         | number[]                                                     | 否       | null                        |
| is-view           | 是否是查看模式，查看模式下，不能删除和新增                                                      | boolean                                                      | 否       | false                       |
| limit-size        | 图片大小限制(MB)，不传时无限制                                                                  | number                                                       | 否       | 无                          |
| http-request      | 覆盖默认的 Xhr 行为，允许自行实现上传文件的请求                                                 | (options: UploadRequestOptions) => XMLHttpRequest \| Promise | 否       | 无                          |
| rename            | 图片名称是否重新随机生成                                                                        | Boolean                                                      | 否       | true                        |
| accept     | 控制文件选择对话框中显示的文件类型   | string     | 否     | image/*|
### 插槽（slots）

| 插槽名 | 说明 | 作用域 | 子标签 |
| ------ | ---- | ------ | ------ |
| 无     | 无   | 无     | 无     |

### 事件（events）

| 事件名 | 说明 | 接受参数 |
| ------ | ---- | -------- |
| 无     | 无   | 无       |
