<template>
  <te-upload
    ref="uploadRef"
    class="upload-demo"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    :auto-upload="false"
  >
    <template #trigger>
      <te-button type="primary">select file</te-button>
    </template>

    <te-button class="ml-3" type="success" @click="submitUpload">
      upload to server
    </te-button>

    <template #tip>
      <div class="te-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </te-upload>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadInstance } from '@tiansu/element-plus'

const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
  uploadRef.value!.submit()
}
</script>
