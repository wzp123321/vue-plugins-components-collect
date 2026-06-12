# Upload 上传组件

上传组件，用于上传图片、视频或普通文件。支持媒体类型以卡片形式展示，文件类型以列表形式展示。

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  | -          | -   |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名          | 说明                                                    | 类型                                                                   | 是否必填 | 默认值                |
| --------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- | -------- | --------------------- |
| fileList        | 已上传的文件列表                                        | `{ name: string; url: string; size?: number }[]`                       | 是       | -                     |
| httpRequest     | 上传请求函数，resolve 判定上传成功，reject 判定上传失败 | `(file: any) => Promise<{ name: string; url: string; size?: number }>` | 是       | -                     |
| type            | 上传类型                                                | `'file' 'media'`                                                       | 否       | `'media'`             |
| mediaTypes      | type=media 时，图片和视频是否都需要                     | `('image' 'video')[]`                                                  | 否       | `['image']`           |
| imageSourceType | 图片来源，可选相册或拍照                                | `('album' 'camera')[]`                                                 | 否       | `['album', 'camera']` |
| videoSourceType | 视频来源，可选相册或拍照                                | `('album' 'camera')[]`                                                 | 否       | `['album', 'camera']` |
| maxCountImage   | 图片最大上传数量                                        | `number`                                                               | 否       | `5`                   |
| maxCountVideo   | 视频最大上传数量                                        | `number`                                                               | 否       | `1`                   |
| maxSizeImage    | 图片单个文件最大大小（单位：kb）                        | `number`                                                               | 否       | `500`                 |
| maxSizeVideo    | 视频单个文件最大大小（单位：MB）                        | `number`                                                               | 否       | `500`                 |
| accept          | 允许上传的文件类型，type=file 时生效，默认不限制        | `string[]`                                                             | 否       | -                     |
| maxCountFile    | 文件最大上传数量                                        | `number`                                                               | 否       | `4`                   |
| maxSizeFile     | 单个文件最大大小（单位：MB）                            | `number`                                                               | 否       | `500`                 |
| beforeUpload    | 上传前的钩子函数，返回 false 阻止上传                   | `(file: any) => Promise<boolean> \| boolean`                           | 否       | -                     |
| disabled        | 是否禁用                                                | `boolean`                                                              | 否       | `false`               |
| readonly        | 是否只读                                                | `boolean`                                                              | 否       | `false`               |
| customClass     | 自定义类名                                              | `string`                                                               | 否       | -                     |
| customStyle     | 自定义样式                                              | `CSSProperties`                                                        | 否       | `{}`                  |

## Events

| 事件名            | 说明               | 参数                |
| ----------------- | ------------------ | ------------------- |
| success           | 上传成功时触发     | `(response: any)`   |
| error             | 上传失败时触发     | `(error: any)`      |
| remove            | 删除文件时触发     | `(index: number)`   |
| 'update:fileList' | 文件列表变化时触发 | `(fileList: any[])` |

## 使用示例

```vue
<template>
  <tsm-upload
    type="media"
    v-model:fileList="fileList"
    :maxCountImage="5"
    :maxCountVideo="1"
    :mediaTypes="['image', 'video']"
    :beforeUpload="beforeUpload"
    :httpRequest="httpRequest"
    @success="handleSuccess"
    @error="handleError"
    @remove="handleRemove"
  />
</template>

<script setup>
const beforeUpload = file => {
  return new Promise(resolve => {
    resolve(true);
  });
};

const httpRequest = async file => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        url: 'https://example.com/file.jpg',
        name: file.name,
      });
    }, 1000);
  });
};

const handleSuccess = res => {
  console.log('上传成功:', res);
};

const handleError = err => {
  console.log('上传失败:', err);
};

const handleRemove = index => {
  console.log('删除文件:', index);
};
</script>
```
