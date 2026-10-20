---
title: ImageViewer 图片预览
lang: zh-CN
---

# ImageViewer 图片（视频）预览

图片（视频）预览组件

## 基础用法

:::demo

mobile/image-viewer/basic

:::

## ImageViewer 属性

| 属性名  | 说明                 | 类型                                                            | 默认值      |
| ------- | -------------------- | --------------------------------------------------------------- | ----------- |
| urls    | 媒体资源集合         | ^[Array]`{fileType: 'image' \| 'video', url: string} \| string` | []          |
| type    | 类型                 | `image \| video`                                                | ''          |
| current | 当前展示的图片索引   | Number                                                          | 0           |
| mode    | 图片展示模式         | String                                                          | 'aspectFit' |
| confirm | 是否需要删除二次确认 | Boolean                                                         | false       |

## ImageViewer 事件

|    事件名    |      说明      |          返回值           |
| :----------: | :------------: | :-----------------------: |
| @deleteImage | 删除媒体时触发 | `(index: Number) => void` |
