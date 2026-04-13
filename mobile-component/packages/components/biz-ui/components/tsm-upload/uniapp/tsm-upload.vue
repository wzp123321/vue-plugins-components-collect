/** * Upload 上传组件 * @description 上传组件，用于文件上传 */
<template>
  <view class="tsm-upload" :class="[customClass]" :style="uploadStyleObj">
    <view class="tsm-upload__list">
      <view class="tsm-upload__item" v-for="(item, index) in fileList" :key="index">
        <image
          class="tsm-upload__item__image"
          :src="item.url || item.path"
          mode="aspectFill"
          @tap="previewImage(index)"
        />
        <view class="tsm-upload__item__delete" @tap="removeImage(index)" v-if="!disabled">
          <icon-setting />
        </view>
      </view>
      <view class="tsm-upload__add" v-if="fileList.length < maxCount && !disabled" @tap="chooseImage">
        <icon-setting />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { UploadProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * Upload 组件 Props
 * @property {array} fileList - 已上传的文件列表
 * @property {number} maxCount - 最大上传数量
 * @property {boolean} disabled - 是否禁用
 * @property {string} action - 上传地址
 * @property {object} headers - 上传请求头
 * @property {string} name - 上传文件字段名
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<UploadProps>(), defaultProps);

const emit = defineEmits<{
  change: [fileList: any[]];
  success: [response: any];
  error: [error: any];
  remove: [index: number];
  'update:fileList': [fileList: any[]];
}>();

const uploadStyleObj = computed(() => {
  return addStyle(props.customStyle || {});
});

const chooseImage = () => {
  const count = props.maxCount - props.fileList.length;
  uni.chooseImage({
    count: Math.min(count, 9),
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res: any) => {
      const newFiles = res.tempFilePaths.map((path: string) => ({
        path,
        url: path,
        status: 'uploading',
      }));
      const newFileList = [...props.fileList, ...newFiles];
      emit('update:fileList', newFileList);
      emit('change', newFileList);
      uploadFiles(newFiles);
    },
  });
};

const uploadFiles = (files: any[]) => {
  if (!props.action) return;

  files.forEach(file => {
    uni.uploadFile({
      url: props.action,
      filePath: file.path,
      name: props.name,
      header: props.headers,
      success: (res: any) => {
        file.status = 'success';
        file.response = res.data;
        emit('success', res);
      },
      fail: (err: any) => {
        file.status = 'error';
        file.error = err;
        emit('error', err);
      },
    });
  });
};

const removeImage = (index: number) => {
  const newFileList = [...props.fileList];
  newFileList.splice(index, 1);
  emit('update:fileList', newFileList);
  emit('change', newFileList);
  emit('remove', index);
};

const previewImage = (index: number) => {
  const urls = props.fileList.map(item => item.url || item.path);
  uni.previewImage({
    current: urls[index],
    urls,
  });
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-upload {
  width: 100%;
}

.tsm-upload__list {
  display: flex;
  flex-wrap: wrap;
  @include tsm-gap(8px, 8px);
}

.tsm-upload__item {
  @include tsm-flex-wrap-gap-item(8px, 8px);
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.tsm-upload__item__image {
  width: 100%;
  height: 100%;
}

.tsm-upload__item__delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 0 4px;
}

.tsm-upload__add {
  @include tsm-flex-wrap-gap-item(8px, 8px);
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}
</style>
