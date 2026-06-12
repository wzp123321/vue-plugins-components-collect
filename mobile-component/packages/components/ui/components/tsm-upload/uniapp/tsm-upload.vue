/** * Upload 上传组件 * @description 上传组件，用于文件上传 */
<template>
  <view class="tsm-upload" :class="[customClass]" :style="customStyle">
    <!-- 媒体上传 -->
    <tsm-upload-media
      v-if="type === 'media'"
      :fileList="fileList"
      :httpRequest="httpRequest"
      :mediaTypes="mediaTypes"
      :imageSourceType="imageSourceType"
      :videoSourceType="videoSourceType"
      :maxCountImage="maxCountImage"
      :maxCountVideo="maxCountVideo"
      :maxSizeImage="maxSizeImage"
      :maxSizeVideo="maxSizeVideo"
      :beforeUpload="beforeUpload"
      :disabled="disabled"
      :readonly="readonly"
      @success="$emit('success', $event)"
      @error="$emit('error', $event)"
      @remove="$emit('remove', $event)"
      @update:fileList="$emit('update:fileList', $event)"
    />

    <!-- 文件上传 -->
    <tsm-upload-file
      v-else-if="type === 'file'"
      :fileList="fileList"
      :httpRequest="httpRequest"
      :accept="accept"
      :maxCountFile="maxCountFile"
      :maxSizeFile="maxSizeFile"
      :beforeUpload="beforeUpload"
      :disabled="disabled"
      :readonly="readonly"
      @success="$emit('success', $event)"
      @error="$emit('error', $event)"
      @remove="$emit('remove', $event)"
      @update:fileList="$emit('update:fileList', $event)"
    />
  </view>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import type { UploadProps } from './props';
import { defaultProps } from './props';
import TsmUploadMedia from './component/tsm-upload-media.vue';
import TsmUploadFile from './component/tsm-upload-file.vue';

const props = withDefaults(defineProps<UploadProps>(), defaultProps);

const emit = defineEmits<{
  success: [response: any];
  error: [error: any];
  remove: [index: number];
  'update:fileList': [fileList: any[]];
}>();
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-upload {
  width: 100%;
}
</style>
