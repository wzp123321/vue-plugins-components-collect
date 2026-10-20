<template>
  <te-upload
    class="upload-demo"
    drag
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    multiple
  >
    <te-icon class="te-icon--upload"><upload-filled /></te-icon>
    <div class="te-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="te-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </te-upload>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
</script>
