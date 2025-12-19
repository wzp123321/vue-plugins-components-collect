<!-- <template>
  <div class="demo">
    <div class="demo-input">
      <a-button @click="handleStart">选择文件</a-button>
      <a-button @click="handleUpload">开始上传</a-button>
    </div>
    <div v-if="fileList?.length > 0" class="demo-file-list">
      <a-descriptions title="文件详情">
        <a-descriptions-item label="文件名称">{{ fileList[0].name }}</a-descriptions-item>
        <a-descriptions-item label="文件大小">{{ formatFileSize(fileList[0].size) }}</a-descriptions-item>
        <a-descriptions-item label="文件类型">
          <img :src="mapFileTypeIcon(fileList[0].name)" alt="icon" />
        </a-descriptions-item>
        <a-descriptions-item label="MD5">
          {{ md5 }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFileHandler } from '@/hooks';
import { ref } from 'vue';
import { COMMON_ACCEPT_FILE_EXTENDS } from '@/config';
import { cloneDeep } from 'lodash';

const {
  fileList,
  handleFileChoose,
  mapFileMD5,
  mapFileChunks,
  verifyUpload,
  FBlobHandler,
  FDownLoadHandler,
  mapFileTypeIcon,
  formatFileSize,
} = useFileHandler();

const md5 = ref('');
const chunks = ref<{ index: number; data: Blob }[]>([]);
const taskList = ref<any>([]);
const completeList = ref<number[]>([]);
const handleStart = async () => {
  const accept = Object.keys(COMMON_ACCEPT_FILE_EXTENDS).join();
  const files = (await handleFileChoose(accept, true)) as FileList;
  fileList.value = [...files];
  md5.value = (await mapFileMD5(fileList.value[0])) ?? '';
};

const handleSingleChunkUpload = (chunk: { index: number; data: Blob }): Promise<{ index: number; data: Blob }> => {
  const time = Number((Math.random() * 5).toFixed(0));
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('上传chunk了', chunk);
      resolve(chunk);
    }, time);
  });
};

// 每次批量请求数量
const batchCount = ref(10);
const startChunk = ref(0);
const handleUpload = async () => {
  const CHUNK_SIZE = 2;
  let uploadIndex = batchCount.value;
  chunks.value = mapFileChunks(fileList.value[0], CHUNK_SIZE);

  const executeTask = async (data: { index: number; data: Blob }) => {
    const res = await handleSingleChunkUpload(data);
    if (res) {
      uploadIndex++;
      completeList.value.push(res?.index);
      console.log('uploadIndex', uploadIndex, chunks.value.length - 1);
      if (uploadIndex < chunks.value.length - 1) {
        executeTask(chunks.value[uploadIndex]);
      }
      // 判断是否完成
      if (completeList.value.length === chunks.value.length) {
        console.log('上传完成');
      }
    } else {
      console.log('当前分片上传失败', data);
    }
  };
  const initList = cloneDeep(chunks.value)?.splice(0, startChunk.value + batchCount.value);
  console.log(initList, chunks.value, startChunk.value + batchCount.value);
  initList.forEach((item) => {
    executeTask(item);
  });
};
</script>

<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .demo-input {
    display: flex;
    align-items: center;
    gap: 24px;
    .ant-input {
      width: 200px;
    }
  }
  .demo-file-list {
    width: 100%;
  }
}
</style> -->

<template>
  <div>
    <input type="file" @change="selectFile" />
    <button @click="upload">上传</button>
    <div v-if="progress > 0">上传进度：{{ progress }}%</div>
  </div>
</template>

<script setup lang="ts">
import { useBigFileUpload } from './useBigFileUpload';

const { file, progress, selectFile, upload } = useBigFileUpload();
</script>