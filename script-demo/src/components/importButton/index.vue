<template>
  <section class="import-button">
    <te-button @click="handleUpload" :="$attrs">
      {{ buttonTitle }}
    </te-button>
    <te-import
      v-model="importVisible"
      :importApi="importPath"
      :importParam="importParam"
      :callBackDownloadTemplate="downloadTemplate"
      :callbackRequestImportApi="importCallback"
      :httpRequest="request"
      :importInterruptApi="cancelUrl"
      :importProgressApi="progressUrl"
      :callBackImportEnd="success"
      :tips="tips"
      :callBackDownloadImportRes="downLoadResult"
      :fileSizeLimit="51200000000"
    ></te-import>
  </section>
</template>
<script lang="ts" setup>
import { watch, nextTick } from 'vue';
import { TeImport } from '@tiansu/ts-web-package';
import { useImport } from './hooks/useImport';

const emits = defineEmits(['success']);
const props = withDefaults(
  defineProps<{
    buttonTitle?: string;
    importUrl: string;
    templateCode: string;
    importParam?: object;
    tips?: string[];
    downloadTemplateUrl?: string; // 新增：支持外部传入下载模板接口
    templateFileName?: string; // 新增：支持外部传入模板文件名
  }>(),
  {
    buttonTitle: '导入',
  },
);

const {
  importVisible,
  importPath,
  request,
  downloadTemplate,
  handleUpload,
  importCallback,
  progressUrl,
  cancelUrl,
  completeImport,
  downLoadResult,
  importCompleted,
} = useImport({
  importUrl: props.importUrl,
  templateCode: props.templateCode,
  downloadTemplateUrl: props.downloadTemplateUrl, // 传递下载模板接口
  templateFileName: props.templateFileName, // 传递模板文件名
});

// 监听弹框关闭事件，当弹框关闭且导入已完成时，触发刷新列表
watch(importVisible, (visible) => {
  // 当弹框从打开变为关闭，且导入已完成时，触发刷新列表
  if (!visible && importCompleted.value) {
    nextTick(() => {
      emits('success');
      importCompleted.value = false; // 重置状态
    });
  }
});

const success = (data: { failCount: number }) => {
  completeImport(data);
  // 无论是否有错误数据，导入完成后都标记为已完成
  // 实际的刷新会在弹框关闭时触发（通过 watch 监听 importVisible）
};
</script>
<style lang="scss" scoped>
.import-button {
  display: inline-block;
}
</style>
