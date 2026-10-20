<template>
  <te-upload action="#" list-type="picture-card" :auto-upload="false">
    <te-icon><Plus /></te-icon>

    <template #file="{ file }">
      <div>
        <img class="te-upload-list__item-thumbnail" :src="file.url" alt="" />
        <span class="te-upload-list__item-actions">
          <span
            class="te-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <te-icon><zoom-in /></te-icon>
          </span>
          <span
            v-if="!disabled"
            class="te-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <te-icon><Download /></te-icon>
          </span>
          <span
            v-if="!disabled"
            class="te-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <te-icon><Delete /></te-icon>
          </span>
        </span>
      </div>
    </template>
  </te-upload>

  <te-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </te-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'

import type { UploadFile } from '@tiansu/element-plus'

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)

const handleRemove = (file: UploadFile) => {
  console.log(file)
}

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const handleDownload = (file: UploadFile) => {
  console.log(file)
}
</script>
