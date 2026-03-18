<template>
  <div class="large-file-upload">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>大文件分片上传 Demo</span>
        </div>
      </template>

      <div class="upload-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :drag="true"
          class="upload-dragger"
        >
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">支持大文件分片上传，每片 10MB，支持并发上传</div>
          </template>
        </el-upload>

        <div v-if="currentFile" class="file-info">
          <div class="info-item">
            <span class="label">文件名：</span>
            <span class="value">{{ currentFile.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件大小：</span>
            <span class="value">{{ formatFileSize(currentFile.size) }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件标识：</span>
            <span class="value">{{ fileHash || '计算中...' }}</span>
          </div>
          <div class="info-item">
            <span class="label">分片数量：</span>
            <span class="value">{{ chunkList.length }} 片</span>
          </div>
        </div>

        <div v-if="currentFile" class="upload-actions">
          <el-button type="primary" @click="startUpload" :loading="uploading" :disabled="!fileHash">开始上传</el-button>
          <el-button @click="pauseUpload" :disabled="!uploading">暂停</el-button>
          <el-button @click="resetUpload" :disabled="uploading">重置</el-button>
        </div>

        <div v-if="uploading || uploadProgress > 0" class="progress-section">
          <div class="progress-info">
            <span>上传进度：{{ uploadProgress.toFixed(2) }}%</span>
            <span>已上传：{{ uploadedChunks }}/{{ chunkList.length }} 片</span>
            <span>上传速度：{{ uploadSpeed }}</span>
          </div>
          <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : ''" />
        </div>

        <div v-if="chunkList.length > 0" class="chunk-list">
          <div class="chunk-title">分片状态</div>
          <div class="chunk-grid">
            <div
              v-for="(chunk, index) in chunkList"
              :key="index"
              class="chunk-item"
              :class="getChunkStatusClass(chunk.status)"
            >
              <span class="chunk-index">片 {{ index + 1 }}</span>
              <span class="chunk-status">{{ getChunkStatusText(chunk.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <span>上传日志</span>
          <el-button size="small" @click="clearLogs">清空日志</el-button>
        </div>
      </template>
      <div class="log-content">
        <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import SparkMD5 from 'spark-md5';

defineOptions({
  name: 'LargeFileUpload',
});

const CHUNK_SIZE = 10 * 1024 * 1024;
const CONCURRENT_UPLOADS = 3;

interface Chunk {
  index: number;
  start: number;
  end: number;
  blob: Blob;
  status: 'pending' | 'uploading' | 'success' | 'error';
  retryCount: number;
}

interface Log {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const currentFile = ref<File | null>(null);
const fileHash = ref('');
const chunkList = ref<Chunk[]>([]);
const uploading = ref(false);
const paused = ref(false);
const uploadedChunks = ref(0);
const uploadProgress = ref(0);
const startTime = ref(0);
const logs = ref<Log[]>([]);

const uploadSpeed = computed(() => {
  if (uploadProgress.value === 0 || uploadProgress.value === 100) return '0 KB/s';
  const elapsed = (Date.now() - startTime.value) / 1000;
  if (elapsed === 0) return '0 KB/s';
  const speed = (uploadedChunks.value * CHUNK_SIZE) / elapsed;
  return formatFileSize(speed) + '/s';
});

function addLog(message: string, type: Log['type'] = 'info') {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  logs.value.unshift({ time, message, type });
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
}

function clearLogs() {
  logs.value = [];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function handleFileChange(file: any) {
  if (!file.raw) return;
  currentFile.value = file.raw;
  fileHash.value = '';
  chunkList.value = [];
  uploadedChunks.value = 0;
  uploadProgress.value = 0;
  addLog(`选择文件: ${file.raw.name} (${formatFileSize(file.raw.size)})`);
  calculateFileHash(file.raw);
}

async function calculateFileHash(file: File) {
  addLog('开始计算文件 hash...', 'info');
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  let currentChunk = 0;

  const loadNext = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));

      fileReader.onload = (e) => {
        spark.append(e.target?.result as ArrayBuffer);
        currentChunk++;
        if (currentChunk < chunks) {
          loadNext().then(resolve).catch(reject);
        } else {
          fileHash.value = spark.end();
          addLog(`文件 hash 计算完成: ${fileHash.value}`, 'success');
          createChunks(file);
          resolve();
        }
      };

      fileReader.onerror = (error) => {
        addLog(`计算 hash 失败: ${error}`, 'error');
        reject(error);
      };
    });
  };

  try {
    await loadNext();
  } catch (error) {
    addLog(`计算 hash 出错: ${error}`, 'error');
  }
}

function createChunks(file: File) {
  const chunks: Chunk[] = [];
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push({
      index: i,
      start,
      end,
      blob: file.slice(start, end),
      status: 'pending',
      retryCount: 0,
    });
  }

  chunkList.value = chunks;
  addLog(`文件分片完成，共 ${totalChunks} 片`, 'success');
}

async function startUpload() {
  if (!currentFile.value || !fileHash.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  uploading.value = true;
  paused.value = false;
  startTime.value = Date.now();
  addLog('开始上传文件...', 'info');

  await uploadChunksConcurrently();
}

function pauseUpload() {
  paused.value = true;
  addLog('上传已暂停', 'warning');
}

function resetUpload() {
  uploading.value = false;
  paused.value = false;
  uploadedChunks.value = 0;
  uploadProgress.value = 0;
  chunkList.value.forEach((chunk) => {
    chunk.status = 'pending';
    chunk.retryCount = 0;
  });
  addLog('上传已重置', 'info');
}

async function uploadChunksConcurrently() {
  const pendingChunks = chunkList.value.filter((chunk) => chunk.status === 'pending');

  if (pendingChunks.length === 0) {
    if (chunkList.value.every((chunk) => chunk.status === 'success')) {
      await notifyMergeComplete();
    }
    return;
  }

  const uploadPromises: Promise<void>[] = [];
  let currentIndex = 0;

  const uploadNextChunk = async () => {
    while (currentIndex < pendingChunks.length && paused.value) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (currentIndex >= pendingChunks.length || paused.value) {
      return;
    }

    const chunk = pendingChunks[currentIndex];
    currentIndex++;

    if (chunk.status !== 'pending') {
      return uploadNextChunk();
    }

    await uploadChunk(chunk);

    if (!paused.value) {
      return uploadNextChunk();
    }
  };

  for (let i = 0; i < Math.min(CONCURRENT_UPLOADS, pendingChunks.length); i++) {
    uploadPromises.push(uploadNextChunk());
  }

  await Promise.all(uploadPromises);

  if (!paused.value) {
    const allSuccess = chunkList.value.every((chunk) => chunk.status === 'success');
    if (allSuccess) {
      await notifyMergeComplete();
    }
  }
}

async function uploadChunk(chunk: Chunk) {
  chunk.status = 'uploading';

  const formData = new FormData();
  formData.append('file', chunk.blob);
  formData.append('hash', fileHash.value);
  formData.append('index', chunk.index.toString());
  formData.append('total', chunkList.value.length.toString());
  formData.append('filename', currentFile.value!.name);

  try {
    await mockUploadRequest(formData);

    chunk.status = 'success';
    uploadedChunks.value++;
    uploadProgress.value = (uploadedChunks.value / chunkList.value.length) * 100;

    addLog(`分片 ${chunk.index + 1} 上传成功`, 'success');
  } catch (error) {
    chunk.status = 'error';
    chunk.retryCount++;

    if (chunk.retryCount < 3) {
      addLog(`分片 ${chunk.index + 1} 上传失败，正在重试 (${chunk.retryCount}/3)...`, 'warning');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      chunk.status = 'pending';
      await uploadChunk(chunk);
    } else {
      addLog(`分片 ${chunk.index + 1} 上传失败，已达最大重试次数`, 'error');
    }
  }
}

async function mockUploadRequest(formData: FormData): Promise<void> {
  return new Promise((resolve, reject) => {
    const randomDelay = Math.random() * 2000 + 500;
    setTimeout(() => {
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error('模拟上传失败'));
      }
    }, randomDelay);
  });
}

async function notifyMergeComplete() {
  uploading.value = false;
  addLog('所有分片上传完成，通知服务器合并文件...', 'info');

  await mockMergeRequest();

  addLog(`文件 ${currentFile.value?.name} 上传完成！`, 'success');
  ElMessage.success('文件上传完成！');
}

async function mockMergeRequest(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      addLog('服务器合并文件完成', 'success');
      resolve();
    }, 1000);
  });
}

function getChunkStatusClass(status: string) {
  return {
    'status-pending': status === 'pending',
    'status-uploading': status === 'uploading',
    'status-success': status === 'success',
    'status-error': status === 'error',
  };
}

function getChunkStatusText(status: string) {
  const statusMap = {
    pending: '等待中',
    uploading: '上传中',
    success: '已完成',
    error: '失败',
  };
  return statusMap[status as keyof typeof statusMap] || status;
}
</script>

<style lang="less" scoped>
.large-file-upload {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .upload-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 16px;
    }

    .upload-content {
      .upload-dragger {
        width: 100%;
      }

      .file-info {
        margin-top: 20px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;

        .info-item {
          display: flex;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            font-weight: bold;
            width: 100px;
            color: #606266;
          }

          .value {
            flex: 1;
            color: #303133;
          }
        }
      }

      .upload-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
      }

      .progress-section {
        margin-top: 20px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #606266;
        }
      }

      .chunk-list {
        margin-top: 20px;

        .chunk-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #303133;
        }

        .chunk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;

          .chunk-item {
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            font-size: 12px;
            border: 1px solid #dcdfe6;
            transition: all 0.3s;

            .chunk-index {
              display: block;
              font-weight: bold;
              margin-bottom: 5px;
            }

            .chunk-status {
              display: block;
            }

            &.status-pending {
              background: #f5f7fa;
              color: #909399;
            }

            &.status-uploading {
              background: #ecf5ff;
              border-color: #409eff;
              color: #409eff;
            }

            &.status-success {
              background: #f0f9ff;
              border-color: #67c23a;
              color: #67c23a;
            }

            &.status-error {
              background: #fef0f0;
              border-color: #f56c6c;
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .log-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 16px;
    }

    .log-content {
      max-height: 300px;
      overflow-y: auto;
      background: #f5f7fa;
      border-radius: 4px;
      padding: 10px;

      .log-item {
        padding: 5px 0;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        gap: 10px;
        font-size: 13px;

        &:last-child {
          border-bottom: none;
        }

        .log-time {
          color: #909399;
          min-width: 70px;
        }

        .log-message {
          flex: 1;
        }

        &.info {
          .log-message {
            color: #303133;
          }
        }

        &.success {
          .log-message {
            color: #67c23a;
          }
        }

        &.error {
          .log-message {
            color: #f56c6c;
          }
        }

        &.warning {
          .log-message {
            color: #e6a23c;
          }
        }
      }
    }
  }
}
</style>
