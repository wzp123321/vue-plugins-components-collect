<template>
  <div style="height: 200px; width: 700px; border: 1px solid">
    <te-upload-imagecropping
      :data="{ tenantId: 700 }"
      v-model:file-list="fileList"
      :limit="limit"
      :width="100"
      :height="100"
      :on-success="success"
      :isCropper="true"
    ></te-upload-imagecropping>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { TeUploadImagecropping } from '@ts-web-package/components/lib/te-upload-imagecropping';

onMounted(() => {
  fileList.value = ['/images/hero.png'];
});
const fileList = ref<string[]>([]);
const success = (data) => {
  alert(JSON.stringify(fileList.value));
};
const limit = ref(2);
</script>
<script lang="ts">
export default {
  name: 'te-upload-imagecropping-demo',
};
</script>
