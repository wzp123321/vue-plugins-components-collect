<template>
  <div class="plugin-word-pdf-preview">
    <section class="pwpp-btn">
      <el-button @click="handleChoose">选择文件</el-button>
      <el-button :disabled="!currentFile" @click="handleDownload">下载</el-button>
    </section>
    <ul class="pwpp-file-list" v-if="fileList.length">
      <li
        v-for="item in fileList"
        :key="item.name"
        :class="{ active: currentFile?.name === item.name }"
        @click="handleFileSelect(item)"
      >
        <span class="pwpp-file-list-name">{{ item.name }}</span>
        <span class="pwpp-file-list-del" @click.stop="handleFileDelete(item.name)">x</span>
      </li>
    </ul>
    <section class="pwpp-preview">
      <component
        v-if="previewType && fileSrc"
        :is="PREVIEW_COMPONENT_MAP[previewType]"
        :src="fileSrc"
        @rendered="handleRendered"
        @error="handleError"
      />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { useFileHandler } from '../../../hooks';
import VueOfficeDocx from '@vue-office/docx';
import VueOfficePdf from '@vue-office/pdf';
import VueOfficeExcel from '@vue-office/excel';
import {
  DOCX_ACCEPT_EXTENSIONS_STR,
  PDF_ACCEPT_EXTENSIONS_STR,
  PREVIEW_MIME_MAP,
  PreviewType,
  XLSX_ACCEPT_EXTENSIONS_STR,
} from '../../../config/enum';
import '@vue-office/docx/lib/index.css';

const ACCEPTS = `${XLSX_ACCEPT_EXTENSIONS_STR},${DOCX_ACCEPT_EXTENSIONS_STR},${PDF_ACCEPT_EXTENSIONS_STR}`;

const PREVIEW_COMPONENT_MAP = {
  pdf: VueOfficePdf,
  docx: VueOfficeDocx,
  excel: VueOfficeExcel,
} as const;

const { fileList, transferFileToUrl, handleFileChoose } = useFileHandler();

/** 当前预览的文件 */
const currentFile = ref<File | null>(null);
/** 预览组件类型 */
const previewType = computed<PreviewType | ''>(() =>
  currentFile.value ? PREVIEW_MIME_MAP[currentFile.value.type] ?? '' : '',
);
/** 文件地址（ObjectURL） */
const fileSrc = ref('');

// 选中文件变化时刷新预览 URL，并释放上一个 URL
watch(
  currentFile,
  (file) => {
    if (fileSrc.value) {
      URL.revokeObjectURL(fileSrc.value);
    }
    fileSrc.value = file ? transferFileToUrl(file) : '';
  },
  { immediate: true },
);

onUnmounted(() => {
  if (fileSrc.value) {
    URL.revokeObjectURL(fileSrc.value);
    fileSrc.value = '';
  }
});

/** 选择文件（多选），默认选中第一个 */
const handleChoose = async () => {
  const files = (await handleFileChoose(ACCEPTS, true)) as FileList;
  const list = Array.from(files);
  if (!list.length) return;
  fileList.value = list;
  currentFile.value = list[0];
};

const handleFileDelete = (name: string) => {
  fileList.value = fileList.value.filter((item) => item.name !== name);
  if (currentFile.value?.name === name) {
    currentFile.value = fileList.value[0] ?? null;
  }
};

const handleFileSelect = (file: File) => {
  if (currentFile.value?.name !== file.name) {
    currentFile.value = file;
  }
};

/** 下载当前预览文件 */
const handleDownload = () => {
  if (!currentFile.value || !fileSrc.value) return;
  const a = document.createElement('a');
  a.href = fileSrc.value;
  a.download = currentFile.value.name;
  a.click();
  a.remove();
};

const handleRendered = () => {
  console.log('preview rendered');
};
const handleError = (e: unknown) => {
  console.error('preview error', e);
};
</script>

<style lang="less" scoped>
.plugin-word-pdf-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .pwpp-btn {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pwpp-file-list {
    width: 400px;
    li {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
    }

    li:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    li.active {
      background-color: rgba(64, 158, 255, 0.12);
      color: #409eff;
    }

    .pwpp-file-list-name {
      flex: auto;
    }

    .pwpp-file-list-del {
      cursor: pointer;
      padding: 0 6px;
    }
  }

  .pwpp-preview {
    flex: auto;
    width: 100%;
    overflow-y: auto;

    :deep(.vue-office-docx),
    :deep(.vue-office-pdf),
    :deep(.vue-office-excel) {
      height: 100%;
    }
  }
}
</style>
