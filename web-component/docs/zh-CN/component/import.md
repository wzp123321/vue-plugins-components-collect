---
title: Import 导入
lang: zh-CN
---

## 基础用法

:::demo

import/basic

:::

## API

### 属性（props）

| 属性名                           | 说明                                             | 类型                                   | 是否必要 | 默认值                                    |
| -------------------------------- | ------------------------------------------------ | -------------------------------------- | -------- | ----------------------------------------- |
| model-value / v-model            | 是否显示 Dialog                                  | boolean                                | 是       | false                                     |
| accept                           | 文件类型限制                                     | string                                 | 否       | '.xls,.xlsx,.xlsm'                        |
| fileSizeLimit                    | 文件大小限制，KB                                 | number                                 | 否       | 102400                                    |
| httpRequest                      | axios 请求实例                                   | AxiosInstance                          | 是       | -                                         |
| importApi                        | 导入接口 path，例：sl/api/pms/v1/schedule/import | string                                 | 是       | ''                                        |
| importProgressApi                | 导入进度查询接口 path                            | string                                 | 否       | '/api/common/v1/task/{taskId}/progress'   |
| importInterruptApi               | 导入中断接口 path                                | string                                 | 否       | '/api/common/v1/task/{taskId}/cancelTask' |
| callbackRequestImportApi         | 导入接口回调                                     | ^[Function]`(data: Object) => void`    |
| callbackRequestImportProgressApi | 导入进度查询接口回调                             | ^[Function]`(data: Object) => void`    |
| callBackImportInterruptApi       | 导入中断的回调函数                               | ^[Function]`(data: Object) => void`    |
| callBackImportEnd                | 导入完成后的回调函数                             | ^[Function]`() => void`                |
| callBackDownloadImportRes        | 点击下载结果文件的回调函数                       | ^[Function]`(fileUrl: string) => void` |
| callBackDownloadTemplate         | 点击下载模版文件的回调函数                       | ^[Function]`() => void`                |
| fileSizeLimitText                | 文件大小限制描述                                 | string                                 | 否       | -                                         |
| tips                             | 导入提示文案                                     | ^[Array]`string[]`                     | 否       | []                                        |
| showImportTips                   | 是否展示默认的第二行提示文案（tips 为[]时生效）  | boolean                                | 否       | false                                     |
