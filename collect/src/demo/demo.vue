<template>
  <div class="demo">
    <div class="demo-input">
      <a-button @click="handleStart">选择文件</a-button>
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
import { IconClose } from '@arco-iconbox/vue-te';
import { COMMON_ACCEPT_FILE_EXTENDS } from '@/config';

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
const total = ref(0);
const completeList = ref([]);
const handleStart = async () => {
  const accept = Object.keys(COMMON_ACCEPT_FILE_EXTENDS).join();
  const files = (await handleFileChoose(accept, true)) as FileList;
  fileList.value = [...files];
  md5.value = await mapFileMD5(fileList[0]);
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
</style>
