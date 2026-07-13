<template>
  <div class="spark-upload-demo">
    <FileUpload
      :current-file="currentFile"
      :file-hash="fileHash"
      :chunk-list="chunkList"
      :uploading="uploading"
      :paused="paused"
      :upload-progress="uploadProgress"
      :uploaded-chunks="uploadedChunks"
      :upload-speed="uploadSpeed"
      title="大文件分片上传 Demo"
      tip-text="支持大文件分片上传，每片 10MB，支持并发上传"
      @start="startUpload"
      @pause="pauseUpload"
      @reset="resetUpload"
      @file-change="handleFileChange"
    />

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
import { ref } from 'vue';
import { useBigFileUpload } from '@/hooks';
import FileUpload from '@/components/file-upload/file-upload.vue';

defineOptions({
  name: 'LargeFileUpload',
});

interface Log {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const logs = ref<Log[]>([]);

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

const mockUploadRequest = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const randomDelay = Math.random() * 2000 + 500;
    setTimeout(() => {
      Math.random() > 0.2 ? resolve() : reject(new Error('模拟上传失败'));
    }, randomDelay);
  });
};

const mockMergeRequest = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      addLog('服务器合并文件完成', 'success');
      resolve();
    }, 1000);
  });
};

const {
  currentFile,
  fileHash,
  chunkList,
  uploading,
  paused,
  uploadProgress,
  uploadedChunks,
  uploadSpeed,
  startUpload,
  pauseUpload,
  resetUpload,
  prepareAndUpload,
} = useBigFileUpload({
  chunkSize: 10 * 1024 * 1024,
  concurrentUploads: 3,
  maxRetries: 3,
  uploadChunk: mockUploadRequest,
  notifyMerge: mockMergeRequest,
});

async function handleFileChange(file: File) {
  addLog(`选择文件: ${file.name}`, 'info');
  addLog('开始计算文件 hash...', 'info');

  await prepareAndUpload(file);

  if (fileHash.value) {
    addLog(`文件 hash 计算完成: ${fileHash.value}`, 'success');
  }
}
</script>

<style lang="less" scoped>
.spark-upload-demo {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

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

        &.info .log-message {
          color: #303133;
        }
        &.success .log-message {
          color: #67c23a;
        }
        &.error .log-message {
          color: #f56c6c;
        }
        &.warning .log-message {
          color: #e6a23c;
        }
      }
    }
  }
}
</style>
