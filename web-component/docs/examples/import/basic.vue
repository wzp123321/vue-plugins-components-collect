<template>
  <te-button type="primary" @click="handleUpload">点击导入</el-button>
  <te-import
    v-model="excelUploadShow"
    importApi="sl/api/pms/v1/schedule/import"
    :callBackBeforeUpload="callBackBeforeUpload"
    :callBackAfterUpload="callBackAfterUpload"
    :showImportTips="false"
    :fileSizeLimit="5120"
  ></te-import>
</template>

<script lang="ts" setup>
  import { TeImport } from '@ts-web-package/components/lib/te-import';
  import { ElButton } from 'element-plus';
  import { ref } from 'vue';

  const excelUploadShow = ref(false);
  const handleUpload = () => {
    excelUploadShow.value = true;
  };
  const callBackBeforeUpload = (resolve: Function) => {
    const header = {
      token: 123,
    };
    const data = {
      type: 345,
    };
    resolve(header, data);
  };
  const callBackAfterUpload = (res: unknown, resolve: Function) => {};
</script>

<style scoped lang="scss">
</style>
