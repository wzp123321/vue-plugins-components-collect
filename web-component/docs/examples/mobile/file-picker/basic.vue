<template>
  <view style="display: flex; width: 100%">
    <tem-file-picker
      v-model="imgFiles"
      title="上传照片"
      desc="最多上传5张图片"
      file-mediatype="all"
      :image-limit="2"
      :video-limit="2"
      :max-size="20"
      :form-data="{
        type: 'eamAppRepairStartPhoto',
      }"
      :auto-upload="false"
      request-url=""
      @change="handleImgChange"
      @select="handleImgSelect"
      @chooseFile="chooseFileImage"
    ></tem-file-picker>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemFilePicker, TemCell } from '@zpackage/mobile-package';

const imgFiles = ref<[]>([]);
const videoFiles = ref<[]>([]);

const handleImgChange = (val: string[]) => {};

/**
 * 图片文件选择
 * @param val
 */
const handleImgSelect = async (val: {
  tempFilePaths: string[];
  tempFiles: [];
  files: [];
}) => {
  imgFiles.value = val.files;
};

const chooseFileImage = () => {};

/**
 * 视频上传
 * @param item
 */
const handleVideoChange = (item: string[]) => {};

/**
 * 文件选择
 * @param val
 */
const handleVideoSelect = (val: {
  tempFilePaths: string[];
  tempFiles: [];
  files: [];
}) => {};

/**
 * 视频上传
 */

const chooseFileVideo = () => {};
</script>

<style lang="scss">
.row {
  display: flex;
  gap: var(--tem-spacing-l);
  flex-wrap: wrap;
  margin-bottom: var(--tem-spacing-5xl);
}
</style>
