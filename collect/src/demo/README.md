# 大文件分片上传 Demo

基于 Vue 3 + Element Plus 实现的大文件分片上传组件，支持断点续传、并发上传、进度跟踪等功能。

## 功能特性

### 核心功能

1. **文件分片上传**
   - 自动将大文件切分为 10MB 的分片
   - 支持任意大小的文件上传
   - 每个分片独立上传，失败可重试

2. **并发上传**
   - 支持同时上传多个分片（默认 3 个并发）
   - 提高上传效率，充分利用网络带宽
   - 可配置并发数量

3. **进度跟踪**
   - 实时显示整体上传进度
   - 显示已上传分片数量
   - 计算并显示上传速度
   - 每个分片独立状态显示

4. **文件 Hash 计算**
   - 使用 SparkMD5 计算文件唯一标识
   - 支持断点续传和秒传
   - 分片计算，避免大文件内存溢出

5. **上传控制**
   - 支持暂停上传
   - 支持重置上传状态
   - 支持重新上传失败的分片

6. **错误处理**
   - 自动重试机制（最多重试 3 次）
   - 详细的错误日志记录
   - 分片级别的错误处理

7. **日志系统**
   - 实时记录上传过程
   - 支持不同类型的日志（信息、成功、警告、错误）
   - 可清空日志

8. **拖拽上传**
   - 支持拖拽文件到上传区域
   - 也支持点击选择文件

## 技术栈

- **Vue 3**: 使用 Composition API 和 `<script setup>` 语法
- **Element Plus**: UI 组件库
- **SparkMD5**: 文件 hash 计算库
- **TypeScript**: 类型支持

## 配置参数

```typescript
// 分片大小（默认 10MB）
const CHUNK_SIZE = 10 * 1024 * 1024

// 并发上传数量（默认 3）
const CONCURRENT_UPLOADS = 3

// 最大重试次数（硬编码在 uploadChunk 方法中）
const MAX_RETRIES = 3
```

## 核心方法说明

### 1. handleFileChange
处理文件选择事件，初始化上传流程。

```typescript
function handleFileChange(file: any)
```

**功能：**
- 接收用户选择的文件
- 重置上传状态
- 开始计算文件 hash

### 2. calculateFileHash
计算文件的 MD5 hash 值。

```typescript
async function calculateFileHash(file: File)
```

**功能：**
- 使用 SparkMD5 计算文件 hash
- 分片读取文件，避免内存溢出
- 计算完成后自动创建分片

### 3. createChunks
将文件切分为多个分片。

```typescript
function createChunks(file: File)
```

**功能：**
- 根据 CHUNK_SIZE 计算分片数量
- 创建分片对象数组
- 每个分片包含索引、起始位置、结束位置、blob 数据

### 4. startUpload
开始上传文件。

```typescript
async function startUpload()
```

**功能：**
- 验证文件和 hash 是否就绪
- 启动并发上传流程
- 记录开始时间用于计算速度

### 5. uploadChunksConcurrently
并发上传所有分片。

```typescript
async function uploadChunksConcurrently()
```

**功能：**
- 管理并发上传队列
- 自动分配待上传的分片
- 处理暂停逻辑
- 所有分片上传完成后通知服务器合并

### 6. uploadChunk
上传单个分片。

```typescript
async function uploadChunk(chunk: Chunk)
```

**功能：**
- 构造上传表单数据
- 调用上传接口
- 更新分片状态和进度
- 失败时自动重试

### 7. mockUploadRequest
模拟上传请求（需要替换为真实接口）。

```typescript
async function mockUploadRequest(formData: FormData): Promise<void>
```

**功能：**
- 当前为模拟实现
- 随机延迟和随机失败
- **需要替换为真实的后端接口调用**

### 8. notifyMergeComplete
通知服务器合并所有分片。

```typescript
async function notifyMergeComplete()
```

**功能：**
- 所有分片上传完成后调用
- 通知后端合并文件
- 显示上传完成提示

### 9. mockMergeRequest
模拟合并请求（需要替换为真实接口）。

```typescript
async function mockMergeRequest(): Promise<void>
```

**功能：**
- 当前为模拟实现
- **需要替换为真实的后端接口调用**

## 数据结构

### Chunk 接口
```typescript
interface Chunk {
  index: number           // 分片索引
  start: number           // 分片起始位置
  end: number             // 分片结束位置
  blob: Blob              // 分片数据
  status: 'pending' | 'uploading' | 'success' | 'error'  // 分片状态
  retryCount: number      // 重试次数
}
```

### Log 接口
```typescript
interface Log {
  time: string            // 日志时间
  message: string         // 日志消息
  type: 'info' | 'success' | 'error' | 'warning'  // 日志类型
}
```

## 使用方法

### 基本使用

```vue
<template>
  <LargeFileUpload />
</template>

<script setup>
import LargeFileUpload from './demo.vue'
</script>
```

### 上传流程

1. 选择文件（拖拽或点击）
2. 系统自动计算文件 hash
3. 文件自动分片
4. 点击"开始上传"按钮
5. 分片并发上传
6. 所有分片上传完成后通知服务器合并

## 扩展指南

### 1. 替换为真实接口

找到以下两个方法，替换为真实的后端接口调用：

```typescript
// 替换分片上传接口
async function mockUploadRequest(formData: FormData): Promise<void> {
  // 使用 axios 或其他 HTTP 客户端
  const response = await axios.post('/api/upload/chunk', formData, {
    onUploadProgress: (progressEvent) => {
      // 可选：处理上传进度
    }
  })
  return response.data
}

// 替换合并接口
async function mockMergeRequest(): Promise<void> {
  const response = await axios.post('/api/upload/merge', {
    hash: fileHash.value,
    filename: currentFile.value?.name,
    total: chunkList.value.length
  })
  return response.data
}
```

### 2. 调整配置参数

修改以下常量来调整上传行为配置：

```typescript
// 修改分片大小（例如改为 5MB）
const CHUNK_SIZE = 5 * 1024 * 1024

// 修改并发数量（例如改为 5）
const CONCURRENT_UPLOADS = 5
```

### 3. 添加秒传功能

在 `startUpload` 方法中添加秒传检查：

```typescript
async function checkFileExists(hash: string, filename: string) {
  const response = await axios.get('/api/upload/check', {
    params: { hash, filename }
  })
  return response.data.exists
}

async function startUpload() {
  // ... 现有代码
  
  // 添加秒传检查
  const exists = await checkFileExists(fileHash.value, currentFile.value.name)
  if (exists) {
    addLog('文件已存在，秒传成功！', 'success')
    ElMessage.success('文件上传完成（秒传）')
    return
  }
  
  await uploadChunksConcurrently()
}
```

### 4. 添加断点续传

在 `startUpload` 方法中添加断点续传检查：

```typescript
async function getUploadedChunks(hash: string) {
  const response = await axios.get('/api/upload/progress', {
    params: { hash }
  })
  return response.data.uploadedChunks || []
}

async function startUpload() {
  // ... 现有代码
  
  // 检查已上传的分片
  const uploadedIndices = await getUploadedChunks(fileHash.value)
  chunkList.value.forEach((chunk, index) => {
    if (uploadedIndices.includes(index)) {
      chunk.status = 'success'
      uploadedChunks.value++
    }
  })
  
  uploadProgress.value = (uploadedChunks.value / chunkList.value.length) * 100
  
  await uploadChunksConcurrently()
}
```

### 5. 添加上传前验证

```typescript
function validateFile(file: File): boolean {
  // 文件大小限制（例如 10GB）
  const maxSize = 10 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10GB')
    return false
  }
  
  // 文件类型限制
  const allowedTypes = ['video/*', 'image/*', 'application/zip']
  if (!allowedTypes.some(type => file.type.match(type))) {
    ElMessage.error('不支持的文件类型')
    return false
  }
  
  return true
}

function handleFileChange(file: any) {
  if (!file.raw) return
  
  if (!validateFile(file.raw)) {
    return
  }
  
  // ... 现有代码
}
```

### 6. 添加取消上传功能

```typescript
const abortControllerMap = ref<Map<number, AbortController>>(new Map())

async function uploadChunk(chunk: Chunk) {
  const controller = new AbortController()
  abortControllerMap.value.set(chunk.index, controller)
  
  try {
    await mockUploadRequest(formData, controller.signal)
    // ... 成功处理
  } catch (error) {
    if (error.name === 'AbortError') {
      addLog(`分片 ${chunk.index + 1} 已取消`, 'warning')
      return
    }
    // ... 错误处理
  } finally {
    abortControllerMap.value.delete(chunk.index)
  }
}

function cancelUpload() {
  abortControllerMap.value.forEach(controller => {
    controller.abort()
  })
  uploading.value = false
  addLog('上传已取消', 'warning')
}
```

## 注意事项

1. **后端接口要求**
   - 需要实现分片上传接口
   - 需要实现文件合并接口
   - 可选：实现文件存在检查接口（秒传）
   - 可选：实现上传进度查询接口（断点续传）

2. **服务器配置**
   - 确保服务器允许大文件上传
   - 设置合理的超时时间
   - 配置足够的临时存储空间

3. **浏览器兼容性**
   - 需要 ES6+ 支持
   - 需要 FileReader API 支持
   - 需要 FormData API 支持

4. **性能优化**
   - 对于超大文件（> 1GB），建议增加分片大小
   - 根据网络环境调整并发数量
   - 考虑添加本地缓存已上传分片信息

5. **安全性**
   - 验证文件类型和大小
   - 使用 HTTPS 上传
   - 在服务端验证文件 hash
   - 限制上传频率

## 后端接口示例

### 分片上传接口

```
POST /api/upload/chunk

Request:
- file: File (分片文件)
- hash: string (文件 hash)
- index: number (分片索引)
- total: number (总分片数)
- filename: string (文件名)

Response:
{
  "success": true,
  "message": "上传成功"
}
```

### 文件合并接口

```
POST /api/upload/merge

Request:
{
  "hash": "文件 hash",
  "filename": "文件名",
  "total": 分片总数
}

Response:
{
  "success": true,
  "message": "合并成功",
  "url": "文件访问地址"
}
```

### 文件存在检查接口（秒传）

```
GET /api/upload/check?hash=xxx&filename=xxx

Response:
{
  "exists": true,
  "url": "文件访问地址"
}
```

### 上传进度查询接口（断点续传）

```
GET /api/upload/progress?hash=xxx

Response:
{
  "uploadedChunks": [0, 1, 2, 5],  // 已上传的分片索引
  "total": 10
}
```

## 许可证

MIT
