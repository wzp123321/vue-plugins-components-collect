<template>
  <div class="plugin-word-pdf-preview">
    <section class="pwpp-btn">
      <a-button @click="handleFileChoose(ACCEPTS)">选择文件</a-button>
      <a-button @click="handlePreview">预览</a-button>
      <a-button>下载</a-button>
    </section>
    <ul class="pwpp-file-list">
      <li v-for="item in fileList" :key="item.name">
        <span class="pwpp-file-list-name">{{ item.name }}</span>
        <span @click="handleFileDelete(item.name)">x</span>
      </li>
    </ul>
    <section class="pwpp-preview" v-if="fileList && fileList?.length > 0">
      <VueOfficeDocx
        v-if="[DOCX_ACCEPT_EXTENSIONS['.doc'], DOCX_ACCEPT_EXTENSIONS['.docx'] + ''].includes(fileType)"
        :src="fileSrc"
        @rendered="handleRendered"
        @error="handleError"
      ></VueOfficeDocx>
      <VueOfficePdf
        v-if="fileType == PDF_ACCEPT_EXTENSIONS['.pdf']"
        :src="fileSrc"
        @rendered="handleRendered"
        @error="handleError"
      ></VueOfficePdf>
      <VueOfficeExcel
        v-if="
          [
            XLSX_ACCEPT_EXTENSIONS['.xls'],
            XLSX_ACCEPT_EXTENSIONS['.xlsm'],
            XLSX_ACCEPT_EXTENSIONS['.xlsx'] + '',
          ].includes(fileType)
        "
        :src="fileSrc"
        @rendered="handleRendered"
        @error="handleError"
      ></VueOfficeExcel>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useFileHandler } from '../../../hooks';
import VueOfficeDocx from '@vue-office/docx';
import VueOfficePdf from '@vue-office/pdf';
import VueOfficeExcel from '@vue-office/excel';
import {
  XLSX_ACCEPT_EXTENSIONS,
  XLSX_ACCEPT_EXTENSIONS_STR,
  DOCX_ACCEPT_EXTENSIONS,
  DOCX_ACCEPT_EXTENSIONS_STR,
  PDF_ACCEPT_EXTENSIONS,
  PDF_ACCEPT_EXTENSIONS_STR,
} from '../../../config/enum';
import '@vue-office/docx/lib/index.css';
/**
 * 文件类型
 */
const fileType = computed<string>(() => {
  console.log(fileList.value);
  return fileList.value.length > 0 ? fileList.value[0].type : '';
});
// 文件地址
const fileSrc = ref('');

const ACCEPTS = `${XLSX_ACCEPT_EXTENSIONS_STR},${DOCX_ACCEPT_EXTENSIONS_STR},${PDF_ACCEPT_EXTENSIONS_STR}`;

const { fileList, transferFileToUrl, handleFileChoose } = useFileHandler();

const handleFileDelete = (name: string) => {
  fileList.value = fileList.value.filter((item) => item.name !== name);
};
/**
 * 文件预览
 */
const handlePreview = () => {
  fileSrc.value = transferFileToUrl(fileList.value[0]);
};

const handleRendered = () => {
  console.log(1111111111);
};
const handleError = () => {
  console.log(1111111111);
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

    .pwpp-file-list-name {
      flex: auto;
    }
  }

  .pwpp-preview {
    flex: auto;
    width: 100%;
    overflow-y: auto;

    .vue-office-docx {
      height: 100%;
    }
  }
}
</style>
