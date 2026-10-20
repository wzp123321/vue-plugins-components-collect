---
title: Upload 上传
lang: zh-CN
---

# Upload 上传

通过点击或者拖拽上传文件。

## 基础用法

:::demo 通过 `slot` 你可以传入自定义的上传按钮类型和文字提示。 可通过设置 `limit` 和 `on-exceed` 来限制上传文件的个数和定义超出限制时的行为。 可通过设置 `before-remove` 来阻止文件移除操作。

upload/basic

:::

## 覆盖前一个文件

:::demo 设置 `limit` 和 `on-exceed` 可以在选中时自动替换上一个文件。

upload/limit-cover

:::

## 用户头像

在 `before-upload` 钩子中限制用户上传文件的格式和大小。

:::demo

upload/avatar

:::

## 照片墙

使用 `list-type` 属性来设定文件列表的样式。

:::demo

upload/photo-wall

:::

## 自定义缩略图

使用 `scoped-slot` 属性来改变默认的缩略图模板样式。

:::demo

upload/custom-thumbnail

:::

## 图片列表缩略图

:::demo

upload/file-list-with-thumbnail

:::

## 上传文件列表控制

通过 `on-change` 钩子函数来对上传文件的列表进行控制。

:::demo

upload/file-list

:::

## 拖拽上传

你可以将文件拖拽到特定区域以进行上传。

:::demo

upload/drag-and-drop

:::

## 手动上传

:::demo

upload/manual

:::

## API

### 属性

| 名称                            | 描述                                                                                                                | 类型                                                                                                                                                                           | 默认值                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| action ^(required)            | 请求 URL                                                                                                            | ^[string]                                                                                                                                                                    | #                                                                                                                 |
| headers                       | 设置上传的请求头部                                                                                                         | ^[object]`Headers \| Record<string, any>`                                                                                                                             | —                                                                                                                 |
| method                        | 设置上传请求方法                                                                                                          | ^[string]                                                                                                                                                                    | post                                                                                                              |
| multiple                      | 是否支持多选文件                                                                                                          | ^[boolean]                                                                                                                                                                   | false                                                                                                             |
| data                          | 上传时附带的额外参数 从 v2.3.13 支持 `Awaitable` 数据，和 `Function`                                                               | ^[object]`Record<string, any> \| Awaitable<Record<string, any>>` / ^[Function]`(rawFile: UploadRawFile) => Awaitable<Record<string, any>>` | {}                                                                                                                |
| name                          | 上传的文件字段名                                                                                                          | ^[string]                                                                                                                                                                    | file                                                                                                              |
| with-credentials              | 支持发送 cookie 凭证信息                                                                                                  | ^[boolean]                                                                                                                                                                   | false                                                                                                             |
| show-file-list                | 是否显示已上传文件列表                                                                                                       | ^[boolean]                                                                                                                                                                   | true                                                                                                              |
| drag                          | 是否启用拖拽上传                                                                                                          | ^[boolean]                                                                                                                                                                   | false                                                                                                             |
| accept                        | 接受上传的[文件类型](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#attr-accept)（thumbnail-mode 模式下此参数无效） | ^[string]                                                                                                                                                                    | ''                                                                                                                |
| on-preview                    | 点击文件列表中已上传的文件时的钩子                                                                                                 | ^[Function]`(uploadFile: UploadFile) => void`                                                                                                                             | —                                                                                                                 |
| on-remove                     | 文件列表移除文件时的钩子                                                                                                      | ^[Function]`(uploadFile: UploadFile, uploadFiles: UploadFiles) => void`                                                                                                   | —                                                                                                                 |
| on-success                    | 文件上传成功时的钩子                                                                                                        | ^[Function]`(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => void`                                                                                    | —                                                                                                                 |
| on-error                      | 文件上传失败时的钩子                                                                                                        | ^[Function]`(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => void`                                                                                     | —                                                                                                                 |
| on-progress                   | 文件上传时的钩子                                                                                                          | ^[Function]`(evt: UploadProgressEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => void`                                                                         | —                                                                                                                 |
| on-change                     | 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用                                                                                   | ^[Function]`(uploadFile: UploadFile, uploadFiles: UploadFiles) => void`                                                                                                   | —                                                                                                                 |
| on-exceed                     | 当超出限制时，执行的钩子函数                                                                                                    | ^[Function]`(files: File[], uploadFiles: UploadUserFile[]) => void`                                                                                                       | —                                                                                                                 |
| before-upload                 | 上传文件之前的钩子，参数为上传的文件， 若返回` false `或者返回` Promise` 且被 reject，则停止上传。                                                   | ^[Function]`(rawFile: UploadRawFile) => Awaitable<void \| undefined \| null \| boolean \| File \| Blob>`                                                       | —                                                                                                                 |
| before-remove                 | 删除文件之前的钩子，参数为上传的文件和文件列表， 若返回 `false `或者返回 `Promise `且被 reject，则停止删除。                                              | ^[Function]`(uploadFile: UploadFile, uploadFiles: UploadFiles) => Awaitable<boolean>`                                                                               | —                                                                                                                 |
| file-list / v-model:file-list | 默认上传文件                                                                                                            | ^[object]`UploadUserFile[]`                                                                                                                                                  | []                                                                                                                |
| list-type                     | 文件列表的类型                                                                                                           | ^[enum]`'text' \| 'picture' \| 'picture-card'`                                                                                                                             | text                                                                                                              |
| auto-upload                   | 是否自动上传文件                                                                                                          | ^[boolean]                                                                                                                                                                   | true                                                                                                              |
| http-request                  | 覆盖默认的 Xhr 行为，允许自行实现上传文件的请求                                                                                        | ^[Function]`(options: UploadRequestOptions) => XMLHttpRequest \| Promise<unknown>`                                                                                 | [请参考ajaxUpload](https://github.com/element-plus/element-plus/blob/dev/packages/components/upload/src/ajax.ts#L55) |
| disabled                      | 是否禁用上传                                                                                                            | ^[boolean]                                                                                                                                                                   | false                                                                                                             |
| limit                         | 允许上传文件的最大数量                                                                                                       | ^[number]                                                                                                                                                                    | —                                                                                                                 |

### 插槽

| 名称      | 描述         | 类型                              |
| ------- | ---------- | ------------------------------- |
| default | 自定义默认内容    | -                               |
| trigger | 触发文件选择框的内容 | -                               |
| tip     | 提示说明文字     | -                               |
| file    | 缩略图模板的内容   | ^[object]`{ file: UploadFile }` |

### 外部方法

| 名称           | 描述                                                        | 类型                                                                                    |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| abort        | 取消上传请求                                                    | ^[Function]`(file: UploadFile) => void`                                            |
| submit       | 手动上传文件列表                                                  | ^[Function]`() => void`                                                            |
| clearFiles   | 清空已上传的文件列表（该方法不支持在 `before-upload` 中调用）                   | ^[Function]`(status?: UploadStatus[]) => void`                                     |
| handleStart  | 手动选择文件                                                    | ^[Function]`(rawFile: UploadRawFile) => void`                                      |
| handleRemove | 手动移除文件。 `file` 和`rawFile` 已被合并。 `rawFile` 将在 `v2.2.0` 中移除 | ^[Function]`(file: UploadFile \| UploadRawFile, rawFile?: UploadRawFile) => void` |

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
type UploadFiles = UploadFile[]

type UploadUserFile = Omit<UploadFile, 'status' | 'uid'> &
  Partial<Pick<UploadFile, 'status' | 'uid'>>

type UploadStatus = 'ready' | 'uploading' | 'success' | 'fail'

type Awaitable<T> = Promise<T> | T

type Mutable<T> = { -readonly [P in keyof T]: T[P] }

interface UploadFile {
  name: string
  percentage?: number
  status: UploadStatus
  size?: number
  response?: unknown
  uid: number
  url?: string
  raw?: UploadRawFile
}

interface UploadProgressEvent extends ProgressEvent {
  percent: number
}

interface UploadRawFile extends File {
  uid: number
}

interface UploadRequestOptions {
  action: string
  method: string
  data: Record<string, string | Blob | [string | Blob, string]>
  filename: string
  file: File
  headers: Headers | Record<string, string | number | null | undefined>
  onError: (evt: UploadAjaxError) => void
  onProgress: (evt: UploadProgressEvent) => void
  onSuccess: (response: any) => void
  withCredentials: boolean
}
```

</details>
