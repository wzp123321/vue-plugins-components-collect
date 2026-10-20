<!--
 * @Author: lid lid@tiansu-china.com
 * @Date: 2025-04-23 09:46:27
 * @LastEditors: lid lid@tiansu-china.com
 * @LastEditTime: 2025-04-23 09:57:14
 * @FilePath: \ts-web-package\docs\zh-CN\mobile\component\upload.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
---
title: FilePicker 文件上传
lang: zh-CN
---

# FilePicker 文件上传

文件（图片、视频）上传

## 基础用法

:::demo

mobile/file-picker/basic

:::

## FilePicker 属性

| 属性名         | 说明             | 类型                                | 默认值  |
| -------------- | ---------------- | ----------------------------------- | ------- |
| file-mediatype | 选择文件类型     | ^[enum]`'image' \| 'video'\| 'all'` | 'image' |
| image-limit    | 图片数量限制     | ^[Number \| String]                 | 9       |
| video-limit    | 视频数量限制     | ^[Number \| String]                 | 1       |
| water-marks    | 图片水印内容集合 | ^[Array]`Array<String>`             | []      |
| is-compressed    | 是否需要压缩图片 | ^[Boolean]                          | false    | 

其余属性同：[uni-file-picker](https://uniapp.dcloud.net.cn/component/uniui/uni-file-picker.html#api)
