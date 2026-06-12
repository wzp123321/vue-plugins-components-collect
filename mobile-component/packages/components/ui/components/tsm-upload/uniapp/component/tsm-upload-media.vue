/** * Upload Media 媒体上传组件 * @description 媒体上传组件，用于上传图片和视频 */
<template>
  <view class="tsm-upload-media" :class="{ 'tsm-upload-media--disabled': disabled }">
    <!-- 上传限制信息 -->
    <text class="tsm-upload-media-desc">最多上传 {{ maxCountImage }} 张照片、{{ maxCountVideo }} 个视频</text>

    <!-- 已上传文件列表 -->
    <view class="tsm-upload-media-list">
      <view
        v-for="(file, index) in innerFileList"
        :key="index"
        class="tsm-upload-media-item"
        @tap="handlePreview(index)"
      >
        <img v-if="file.type === 'image'" :src="file.url" class="tsm-upload-media-item-image" />
        <view v-else class="tsm-upload-media-item-video">
          <video
            :src="file.url"
            class="tsm-upload-media-item-video-thumbnail"
            :autoplay="false"
            :controls="false"
            :loop="false"
            :showCenterPlayBtn="false"
          ></video>
          <icon-video-play class="tsm-upload-media-item-video-icon" />
        </view>
        <view v-if="file.status === 'loading'" class="tsm-upload-media-item-status" @tap.stop="">
          <icon-loading class="tsm-upload-media-item-status-icon" />
          <text class="tsm-upload-media-item-status-text">上传中...</text>
        </view>
        <view v-else-if="file.status === 'error'" class="tsm-upload-media-item-status" @tap.stop="">
          <icon-warning class="tsm-upload-media-item-status-icon" />
          <text class="tsm-upload-media-item-status-text">上传失败</text>
        </view>
        <view v-else-if="file.status === 'retry'" class="tsm-upload-media-item-status" @tap.stop="handleRetry(file)">
          <icon-refresh class="tsm-upload-media-item-status-icon" />
          <text class="tsm-upload-media-item-status-text">重新上传</text>
        </view>
        <!-- 删除按钮 -->
        <view
          class="tsm-upload-media-item-remove"
          v-if="!readonly && !formItemContext?.readonly"
          @tap.stop="handleRemove(file, index)"
        >
          <icon-close-medium class="tsm-upload-media-item-remove-icon" />
        </view>
      </view>

      <!-- 添加按钮 -->
      <view v-if="canAddMore" class="tsm-upload-media-add" @tap="handleChooseMediaShow">
        <template v-if="mediaTypes.length === 1 && mediaTypes[0] === 'image'">
          <icon-picture class="tsm-upload-media-add-icon" />
          <text class="tsm-upload-media-add-text">图片</text>
        </template>
        <template v-else-if="mediaTypes.length === 1 && mediaTypes[0] === 'video'">
          <icon-video-camera class="tsm-upload-media-add-icon" />
          <text class="tsm-upload-media-add-text">视频</text>
        </template>
        <template v-else>
          <icon-camera class="tsm-upload-media-add-icon" />
          <text class="tsm-upload-media-add-text">图/视频</text>
        </template>
      </view>
    </view>

    <!-- media 方式选择弹出层 -->
    <tsm-action-sheet v-model:show="chooseMediaShow" :actions="sheetActions" @select="handleChooseMedia" />
    <!-- 预览弹出层 -->
    <view class="tsm-upload-media-preview" v-if="previewVisible" @tap.stop="handlePreviewClose">
      <swiper
        class="tsm-upload-media-preview-swiper"
        :indicator-dots="true"
        :current="previewCurrent"
        :circular="true"
        ndicator-color="#ff0000"
      >
        <swiper-item v-for="(file, index) in innerFileList" :key="index" class="tsm-upload-media-preview-item">
          <img v-if="file.type === 'image'" :src="file.url" class="tsm-upload-media-preview-image" />
          <video
            v-else
            :src="file.url"
            class="tsm-upload-media-preview-video"
            :controls="true"
            :autoplay="true"
            :enable-progress-gesture="false"
            @tap.stop=""
          ></video>
        </swiper-item>
      </swiper>
      <view class="tsm-upload-media-preview-close" @tap.stop="handlePreviewClose">
        <icon-close-medium />
      </view>
    </view>
    <!-- 禁用状态的蒙层 -->
    <view class="tsm-upload-media-disabled" v-if="disabled"> </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';
import type { UploadProps } from './mediaProps';
import { defaultProps } from './mediaProps';

const props = withDefaults(defineProps<UploadProps>(), defaultProps);

const emit = defineEmits<{
  success: [response: any];
  error: [error: any];
  remove: [file: any, index: number];
  'update:fileList': [fileList: any[]];
}>();
interface InnerFileInterface {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  status: 'success' | 'error' | 'loading' | 'retry';
}
const innerFileList = ref<InnerFileInterface[]>([]);
const chooseMediaShow = ref(false);
// 预览相关状态
const previewVisible = ref(false);
const previewCurrent = ref(0);
// Inject FormItem 上下文（默认 null，独立使用时正常）
const formItemContext = inject<any>('formItemContext', null);
/**生成12位唯一key */
const generateUniqueKey = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return timestamp + random;
};

/**根据文件的扩展名判断文件类型是否是图片或视频 */
const mediaFileTypes = (url: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp', 'm4v'];

  const extension = url.split('.').pop()?.toLowerCase();

  if (!extension) return 'image';

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  }

  return 'image';
};
watch(
  () => props.fileList,
  newVal => {
    // 处理props.fileList变化，将props.fileList转成innerFileList中已上传的那一部分文件
    let fm: InnerFileInterface[] = newVal.map(file => ({
      id: generateUniqueKey(),
      name: file.name,
      type: mediaFileTypes(file.url),
      url: file.url,
      status: 'success',
    }));
    /** 过滤出非success状态的文件 */
    let unsuccessFiles = innerFileList.value.filter(file => file.status !== 'success');
    /**将fm和unsuccessFiles合并 */
    innerFileList.value = [...fm, ...unsuccessFiles];
  },
  { immediate: true }
);
// 计算是否可以添加更多文件
const canAddMore = computed(() => {
  if (props.readonly === true || formItemContext?.readonly) return false;
  const imageCount = innerFileList.value.filter(file => file.type === 'image').length;
  const videoCount = innerFileList.value.filter(file => file.type === 'video').length;
  return (
    (imageCount < props.maxCountImage && props.mediaTypes.includes('image')) ||
    (videoCount < props.maxCountVideo && props.mediaTypes.includes('video'))
  );
});
/** 弹出层的actions */
const sheetActions = computed(() => {
  let result: { label: string; mediaType: string; sourceType: string }[] = [];
  const imageCount = innerFileList.value.filter(file => file.type === 'image').length;
  const videoCount = innerFileList.value.filter(file => file.type === 'video').length;
  if (imageCount < props.maxCountImage && props.mediaTypes.includes('image')) {
    props.imageSourceType.includes('camera') &&
      result.push({ label: '拍照', mediaType: 'image', sourceType: 'camera' });
    props.imageSourceType.includes('album') &&
      result.push({ label: '本地图片', mediaType: 'image', sourceType: 'album' });
  }
  if (videoCount < props.maxCountVideo && props.mediaTypes.includes('video')) {
    props.videoSourceType.includes('camera') &&
      result.push({ label: '拍视频', mediaType: 'video', sourceType: 'camera' });
    props.videoSourceType.includes('album') &&
      result.push({ label: '本地视频', mediaType: 'video', sourceType: 'album' });
  }
  return result;
});
/**点击图片/视频,弹出媒体文件方式弹出层，当只有一种媒体来源，直接进入选择媒体文件 */
const handleChooseMediaShow = () => {
  if (onlyOneMediaSource.value !== undefined) {
    handleChooseMedia(onlyOneMediaSource.value);
  } else {
    chooseMediaShow.value = true;
  }
};
/**是否只有一种媒体来源（图片或视频） */
const onlyOneMediaSource = computed(() => {
  if (props.mediaTypes.length === 1) {
    if (props.mediaTypes[0] === 'image' && props.imageSourceType.length === 1) {
      if (props.imageSourceType[0] === 'camera') {
        return { mediaType: 'image', sourceType: 'camera' };
      } else {
        return { mediaType: 'image', sourceType: 'album' };
      }
    } else if (props.mediaTypes[0] === 'video' && props.videoSourceType.length === 1) {
      if (props.videoSourceType[0] === 'camera') {
        return { mediaType: 'video', sourceType: 'camera' };
      } else {
        return { mediaType: 'video', sourceType: 'album' };
      }
    }
  }
  return undefined;
});
// 处理选择媒体文件
const handleChooseMedia = (item: { mediaType: string; sourceType: string }) => {
  chooseMediaShow.value = false;
  /**模拟选文件的过程，暂不实现选文件功能 */
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('');
    }, 1000);
  }).then(async (file: any) => {
    //模拟一个选择的文件
    const uniqueKey = generateUniqueKey();
    let f = {
      id: uniqueKey,
      url: 'https://picsum.photos/200/200?random=2&.png',
      name: uniqueKey,
      type: 'image',
      status: 'loading',
    };
    await beforeUpload(f);
  });
};
/** 处理重新上传文件 */
const handleRetry = (file: any) => {
  file.status = 'loading';
  upload(file);
};
const beforeUpload = async (file: any) => {
  /**校验文件类型是否是图片或视频 */

  /**校验文件大小是否超过限制 */

  /**调用外部的beforeUpload校验 */
  if (props.beforeUpload) {
    const result = props.beforeUpload(file);
    // 处理Promise返回值
    if (result && typeof (result as Promise<boolean>).then === 'function') {
      try {
        const promiseResult = await result;
        if (!promiseResult) return;
      } catch (error) {
        return;
      }
    }
    // 处理布尔值返回值
    else if (result === false) {
      return;
    }
  }
  /**以上校验都通过之后，文件以loading状态push到innerFileList */
  file.status = 'loading';
  innerFileList.value.push(file);
  /**上传文件 */
  upload(file);
};
const upload = (file: any) => {
  return props.httpRequest!(file)
    .then(res => {
      //上传成功后，从innerFileList中移除本文件，并且把外部返回的res对象于innerFileList中的成功状态文件合并后通过update:fileList事件传递
      innerFileList.value = innerFileList.value.filter(f => {
        return f.id !== file.id;
      });
      /** 过滤出success状态的文件 */
      let successFiles = innerFileList.value
        .filter(file => file.status === 'success')
        .map(file => ({ name: file.name, url: file.url }));
      /**将successFiles和res合并 */
      emit('update:fileList', [...successFiles, res]);
      formItemContext?.onValueChange(props.fileList);
      handleSuccess(res);
    })
    .catch(err => {
      /**上传失败，将文件状态设置为error */
      let ff = innerFileList.value.find(f => {
        return f.id === file.id;
      });
      ff && (ff.status = 'error');
      setTimeout(() => {
        /**3秒后将文件状态设置为retry */
        ff && (ff.status = 'retry');
      }, 3000);
      handleError(err);
    });
};
const handleSuccess = (res: any) => {
  emit('success', res);
};
const handleError = (err: any) => {
  emit('error', err);
};
// 处理删除文件
const handleRemove = (file: InnerFileInterface, index: number) => {
  if (file.status !== 'success') {
    innerFileList.value.splice(index, 1);
  } else {
    /** 过滤出success状态的文件 */
    let successFiles = innerFileList.value
      .filter(f => f.status === 'success' && f.id !== file.id)
      .map(f => ({ name: f.name, url: f.url }));
    emit('update:fileList', successFiles);
    emit('remove', file, index);
    formItemContext?.onValueChange(props.fileList);
  }
};

// 处理预览
const handlePreview = (index: number) => {
  previewCurrent.value = index;
  previewVisible.value = true;
};

// 处理预览关闭
const handlePreviewClose = () => {
  previewVisible.value = false;
  previewCurrent.value = 0;
};
</script>

<style scoped lang="scss">
@import '../../../../libs/scss/platform-style.scss';

.tsm-upload-media {
  width: 100%;
  position: relative;
  .tsm-upload-media-desc {
    overflow: hidden;
    color: var(--tsm-color-text-secondary);
    text-overflow: ellipsis;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-s);
    font-style: normal;
    font-weight: var(--tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-xs);
  }

  .tsm-upload-media-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--tsm-spacing-m);
    margin-top: var(--tsm-spacing-m);
    align-items: center;
  }

  .tsm-upload-media-item {
    width: 56px;
    height: 56px;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    .tsm-upload-media-item-image {
      width: 100%;
      height: 100%;
      border-radius: var(--tsm-radius-xs);
    }

    .tsm-upload-media-item-video {
      position: relative;
      width: 100%;
      height: 100%;
      video.tsm-upload-media-item-video-thumbnail {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .tsm-upload-media-item-video-icon {
        position: absolute;
        top: 16px;
        left: 16px;
        width: 24px;
        height: 24px;
        color: var(--tsm-color-text-white);
      }
    }
    .tsm-upload-media-item-status {
      position: absolute;
      inset: 0px;
      background-color: var(--tsm-color-overlay-mask);
      display: flex;
      flex-direction: column;
      gap: var(--tsm-spacing-2xs);
      align-items: center;
      justify-content: center;
      .tsm-upload-media-item-status-icon {
        width: 16px;
        height: 16px;
        color: var(--tsm-color-text-white);
      }
      .tsm-upload-media-item-status-text {
        color: var(--tsm-color-text-white);
        font-family: var(--tsm-font-family-regular);
        font-size: var(--tsm-font-size-text-2xs);
        font-style: normal;
        font-weight: var(--tsm-font-weight-regular);
        line-height: var(--tsm-line-height-text-2xs);
      }
    }
    .tsm-upload-media-item-remove {
      position: absolute;
      top: 0;
      right: 0;
      width: 16px;
      height: 16px;
      border-radius: 0 var(--tsm-radius-xs);
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;

      .tsm-upload-media-item-remove-icon {
        width: 16px;
        height: 16px;
        color: var(--tsm-color-text-white) !important;
      }
    }
  }

  .tsm-upload-media-add {
    width: 56px;
    height: 56px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--tsm-spacing-none);
    background-color: var(--tsm-color-bg-white);
    border-radius: var(--tsm-radius-xs);
    border: 1px dashed var(--tsm-color-border-primary);
    box-shadow: 0 1px 2px 0 var(--tsm-shadow-xs);

    .tsm-upload-media-add-icon {
      width: 25px;
      height: 25px;
      color: var(--tsm-color-text-primary) !important;
      margin-bottom: var(--tsm-spacing-xs);
    }

    .tsm-upload-media-add-text {
      color: var(--tsm-color-text-primary);
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-2xs);
      font-style: normal;
      font-weight: var(--tsm-font-weight-regular);
      line-height: var(--tsm-line-height-text-2xs); /* 160% */
    }
  }
  // 选择媒体文件方式弹出层样式
  .tsm-upload-media-choose {
    display: flex;
    flex-direction: column;
    align-items: center;
    .tsm-upload-media-choose-item {
      width: 100%;
      line-height: 56px;
      border-bottom: 0.5px solid var(--tsm-color-border-tertiary);
      color: var(--tsm-color-text-primary);
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-l);
      font-style: normal;
      font-weight: var(--tsm-font-weight-regular);
    }
    .tsm-upload-media-choose-cancel {
      width: 100%;
      height: 56px;
      padding-top: 12px;
      line-height: 48px;
      color: var(--tsm-color-text-primary);
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-l);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      background: var(--tsm-color-bg-secondary);
    }
  }
  .tsm-upload-media-preview {
    max-height: 100%;
    position: fixed;
    inset: 0px;
    z-index: 10075;
    background-color: var(--tsm-color-overlay-mask);
    .tsm-upload-media-preview-swiper {
      width: 100%;
      height: 100%;
      .tsm-upload-media-preview-item {
        width: 100%;
        height: 100%;
        .tsm-upload-media-preview-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .tsm-upload-media-preview-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
    .tsm-upload-media-preview-close {
      position: absolute;
      top: 16px;
      right: 16px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      color: var(--tsm-color-text-white) !important;
    }
  }
  .tsm-upload-media-disabled {
    position: absolute;
    inset: 0;
    background: var(--tsm-color-bg-disabled);
    opacity: 0.6;
  }
}
.tsm-upload-media--disabled {
  pointer-events: none;
}
</style>
