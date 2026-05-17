<template>
  <div class="file-upload">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
        </div>
      </template>

      <div class="upload-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onFileChange"
          :drag="true"
          class="upload-dragger"
        >
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">{{ tipText }}</div>
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
          <div v-if="chunkList.length > 0" class="info-item">
            <span class="label">分片数量：</span>
            <span class="value">{{ chunkList.length }} 片</span>
          </div>
        </div>

        <div v-if="currentFile" class="upload-actions">
          <el-button type="primary" @click="$emit('start')" :loading="uploading" :disabled="!fileHash">
            开始上传
          </el-button>
          <el-button @click="$emit('pause')" :disabled="!uploading || paused">暂停</el-button>
          <el-button @click="$emit('reset')" :disabled="uploading">重置</el-button>
        </div>

        <div v-if="showProgress" class="progress-section">
          <div class="progress-info">
            <span>上传进度：{{ uploadPercentage }}%</span>
            <span>已上传：{{ uploadedChunks }}/{{ chunkList.length }} 片</span>
            <span>上传速度：{{ uploadSpeed }}</span>
          </div>
          <el-progress :percentage="uploadPercentage" :status="uploadPercentage === 100 ? 'success' : ''" />
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { formatFileSize } from '@/utils';

interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  blob: Blob;
  status: 'pending' | 'uploading' | 'success' | 'error';
  retryCount: number;
}

const props = withDefaults(
  defineProps<{
    currentFile: File | null;
    fileHash: string;
    chunkList: ChunkInfo[];
    uploading: boolean;
    paused: boolean;
    uploadProgress: number;
    uploadedChunks: number;
    uploadSpeed: string;
    title?: string;
    tipText?: string;
  }>(),
  {
    title: '大文件分片上传',
    tipText: '支持大文件分片上传，每片 10MB，支持并发上传',
  },
);

defineEmits<{
  start: [];
  pause: [];
  reset: [];
  fileChange: [file: File];
}>();

const showProgress = computed(() => props.uploading || props.uploadProgress > 0);

const uploadPercentage = computed(() => Math.round(props.uploadProgress * 100) / 100);

function onFileChange(file: any) {
  if (file.raw) {
    (props as any).$emit('fileChange', file.raw);
  }
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
  const statusMap: Record<string, string> = {
    pending: '等待中',
    uploading: '上传中',
    success: '已完成',
    error: '失败',
  };
  return statusMap[status] || status;
}
</script>

<style lang="less" scoped>
.file-upload {
  .upload-card {
    .card-header {
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
}
</style>
