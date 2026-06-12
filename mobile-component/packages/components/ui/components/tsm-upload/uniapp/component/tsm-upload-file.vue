/** * Upload File 文件上传组件 * @description 文件上传组件，用于上传文件 */
<template>
  <view class="tsm-upload-file" :class="{ 'tsm-upload-file--disabled': disabled }">
    <!-- 上传限制信息 -->
    <view class="tsm-upload-file-desc">最多上传 {{ maxCountFile }} 个文件，单个文件不超过 {{ maxSizeFile }}MB</view>

    <!-- 已上传文件列表 -->
    <view class="tsm-upload-file-list">
      <view v-for="(file, index) in innerFileList" :key="index" class="tsm-upload-file-item">
        <!-- 文件图标 -->
        <icon-file-type-pdf v-if="file.fileType === 'pdf'" class="tsm-upload-file-item-icon" />
        <icon-file-type-doc v-else-if="file.fileType === 'doc'" class="tsm-upload-file-item-icon" />
        <icon-file-type-xsl v-else-if="file.fileType === 'xls'" class="tsm-upload-file-item-icon" />
        <icon-file-type-ppt v-else-if="file.fileType === 'ppt'" class="tsm-upload-file-item-icon" />
        <icon-file-type-cad v-else-if="file.fileType === 'cad'" class="tsm-upload-file-item-icon" />
        <icon-file-type-folder v-else-if="file.fileType === 'folder'" class="tsm-upload-file-item-icon" />
        <icon-file-type-vsdx v-else-if="file.fileType === 'vsdx'" class="tsm-upload-file-item-icon" />
        <icon-file-type-xsl v-else-if="file.fileType === 'xls'" class="tsm-upload-file-item-icon" />
        <icon-file-type-html v-else-if="file.fileType === 'html'" class="tsm-upload-file-item-icon" />
        <icon-file-type-pic v-else-if="file.fileType === 'pic'" class="tsm-upload-file-item-icon" />
        <icon-file-type-video v-else-if="file.fileType === 'video'" class="tsm-upload-file-item-icon" />
        <icon-file-type-audio v-else-if="file.fileType === 'audio'" class="tsm-upload-file-item-icon" />
        <icon-file-other v-else class="tsm-upload-file-item-icon" />

        <!-- 文件信息 -->
        <view class="tsm-upload-file-item-info">
          <text class="tsm-upload-file-item-name">{{ file.name }}</text>
          <text class="tsm-upload-file-item-size" v-if="file.size && file.status !== 'error'"
            >{{ formatFileSize(file.size) }}
          </text>
          <!-- 加载进度条 -->
          <view v-if="file.status === 'loading'" class="tsm-upload-file-item-progress">
            <view class="tsm-upload-file-item-progress-bar"></view>
          </view>
          <!-- 错误状态 -->
          <text v-else-if="file.status === 'error'" class="tsm-upload-file-item-error">
            {{ file.errMsg || '上传失败' }}
          </text>
        </view>
        <view class="tsm-upload-file-item-remove" v-if="readonly || formItemContext?.readonly">
          <icon-view />
        </view>
        <!-- 删除按钮 -->
        <view class="tsm-upload-file-item-remove" v-else @tap="handleRemove(file, index)">
          <icon-delete />
        </view>
      </view>

      <!-- 添加按钮 -->
      <view v-if="canAddMore" class="tsm-upload-file-add" @tap="handleChooseFile">
        <icon-add class="tsm-upload-file-add-icon" />
        <text class="tsm-upload-file-add-text">添加</text>
      </view>
    </view>
    <!-- 禁用状态的蒙层 -->
    <view class="tsm-upload-file-disabled" v-if="disabled"> </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';
import type { UploadProps } from './fileProps';
import { defaultProps } from './fileProps';

const props = withDefaults(defineProps<UploadProps>(), defaultProps);

const emit = defineEmits<{
  success: [response: any];
  error: [error: any];
  remove: [file: any, index: number];
  'update:fileList': [fileList: any[]];
}>();
// Inject FormItem 上下文（默认 null，独立使用时正常）
const formItemContext = inject<any>('formItemContext', null);
interface InnerFileInterface {
  id: string;
  fileType: string;
  name: string;
  url: string;
  size?: number;
  errMsg?: string;
  status: 'success' | 'error' | 'loading' | 'reset';
}

const innerFileList = ref<InnerFileInterface[]>([]);

// 计算是否可以添加更多文件
const canAddMore = computed(() => {
  if (props.readonly === true || formItemContext?.readonly) return false;
  return innerFileList.value.length < props.maxCountFile!;
});

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'kb';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + 'MB';
  }
};

// 根据文件名获取文件类型图标名称
const getFileIcon = (fileName: string): string => {
  // 获取文件扩展名
  const extension = fileName.split('.').pop()?.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp', 'm4v'];
  //音频
  const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg'];

  // 根据扩展名返回对应的图标名称
  const iconMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'doc',
    xls: 'xls',
    xlsx: 'xls',
    csv: 'xls',
    cad: 'cad',
    ppt: 'ppt',
    pptx: 'ppt',
    zip: 'folder',
    rar: 'folder',
    tar: 'folder',
    txt: 'txt',
    xml: 'html',
    html: 'html',
    vsdx: 'vsdx',
    ...imageExtensions.reduce((acc, cur) => ({ ...acc, [cur]: 'pic' }), {}),
    ...videoExtensions.reduce((acc, cur) => ({ ...acc, [cur]: 'video' }), {}),
    ...audioExtensions.reduce((acc, cur) => ({ ...acc, [cur]: 'audio' }), {}),
  };
  // 如果找到对应的图标则返回，否则返回默认的other图标
  return iconMap[extension || ''] || 'other';
};

// 生成12位唯一key
const generateUniqueKey = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return timestamp + random;
};

// 处理选择文件
const handleChooseFile = () => {
  if (!canAddMore.value) return;
  /**模拟选文件的过程，暂不实现选文件功能 */
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('');
    }, 1000);
  }).then(async (file: any) => {
    //模拟一个选择的文件
    const uniqueKey = generateUniqueKey();
    let n = uniqueKey + '.tar';
    let f = {
      name: n,
      url: '',
      size: 162176, // 162.17kb
      status: 'loading',
      fileType: getFileIcon(n),
    };
    await beforeUpload(f);
  });
};

const beforeUpload = async (file: any) => {
  /** 校验文件类型是否符合要求 */

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
        .map(file => ({ name: file.name, url: file.url, size: file.size }));
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
      ff && ((ff.status = 'error'), (ff.errMsg = err?.errMsg || '上传失败'));
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
      .map(f => ({ name: f.name, url: f.url, size: f.size }));
    emit('update:fileList', successFiles);
    emit('remove', file, index);
    formItemContext?.onValueChange(props.fileList);
  }
};

// 监听fileList变化
watch(
  () => props.fileList,
  newVal => {
    // 处理props.fileList变化，将props.fileList转成innerFileList中已上传的那一部分文件
    let fm: InnerFileInterface[] = newVal.map(file => {
      const extension = getFileIcon(file.name);
      return {
        id: generateUniqueKey(),
        name: file.name,
        url: file.url,
        size: file.size,
        fileType: extension || '',
        status: 'success',
      };
    });
    /** 过滤出非success状态的文件 */
    let unsuccessFiles = innerFileList.value.filter(file => file.status !== 'success');
    /**将fm和unsuccessFiles合并 */
    innerFileList.value = [...fm, ...unsuccessFiles];
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
@import '../../../../libs/scss/platform-style.scss';

.tsm-upload-file {
  width: 100%;

  .tsm-upload-file-desc {
    overflow: hidden;
    margin-bottom: var(--tsm-spacing-xs);
    color: var(--tsm-color-text-secondary);
    text-overflow: ellipsis;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-s);
    font-style: normal;
    font-weight: var(--tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-xs);
  }

  .tsm-upload-file-list {
    display: flex;
    flex-direction: column;
    gap: var(--tsm-spacing-m);
  }

  .tsm-upload-file-item {
    display: flex;
    align-items: center;
    padding: var(--tsm-spacing-m) var(--tsm-spacing-none) var(--tsm-spacing-m) var(--tsm-spacing-xl);
    border-radius: var(--tsm-radius-m);
    border: 1px solid var(--Border---tem-border-color-divider, #ededed);
    background: var(--tsm-color-bg-white);
    .tsm-upload-file-item-icon {
      width: 32px;
      height: 32px;
      margin-right: var(--tsm-spacing-m);
    }
    .tsm-upload-file-item-info {
      position: relative;
      flex: 1 1 0;
      min-height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-right: var(--tsm-spacing-xl);
      .tsm-upload-file-item-name {
        display: block;
        word-break: break-all;
        color: var(--tsm-color-text-primary);
        font-family: var(--tsm-font-family-regular);
        font-size: var(--tsm-font-size-text-m);
        font-style: normal;
        font-weight: var(--tsm-font-weight-regular);
        line-height: var(--tsm-line-height-text-m);
      }
      .tsm-upload-file-item-size {
        display: block;
        color: var(--tsm-color-text-quaternary);
        font-family: var(--tsm-font-family-regular);
        font-size: var(--tsm-font-size-text-s);
        font-style: normal;
        font-weight: var(--tsm-font-weight-regular);
        line-height: var(--tsm-line-height-text-xs); /* 150% */
      }
    }
    .tsm-upload-file-item-progress {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: var(--tsm-color-bg-gray-100);
      border-radius: 2px;
      overflow: hidden;
      .tsm-upload-file-item-progress-bar {
        width: 70%;
        height: 100%;
        background-color: var(--tsm-color-primary);
        border-radius: 2px;
        animation: progress 2s ease-in-out infinite;
      }
    }
    @keyframes progress {
      0% {
        width: 0%;
      }
      50% {
        width: 70%;
      }
      100% {
        width: 0%;
      }
    }

    .tsm-upload-file-item-error {
      display: block;
      color: var(--tsm-color-danger);
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(--tsm-font-weight-regular);
      line-height: var(--tsm-line-height-text-xs); /* 150% */
    }
    .tsm-upload-file-item-remove {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tsm-color-text-secondary);
    }
  }

  .tsm-upload-file-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--tsm-spacing-xs);
    height: 40px;
    padding: 0 var(--tsm-spacing-m);
    border-radius: var(--tsm-radius-m);
    border: 1px dashed var(--tsm-color-border-primary);
    background: var(--Base---tem-color-white, #fff);
    box-shadow: 0 1px 2px 0 var(--tsm-shadow-xs);

    .tsm-upload-file-add-icon {
      width: 20px;
      height: 20px;
      color: var(--tsm-color-text-primary);
    }

    .tsm-upload-file-add-text {
      color: var(--tsm-color-text-primary);
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-l);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-l); /* 150% */
    }
  }
  .tsm-upload-file-disabled {
    position: absolute;
    inset: 0;
    background: var(--tsm-color-bg-disabled);
    opacity: 0.6;
  }
}
.tsm-upload-file--disabled {
  pointer-events: none;
  position: relative;
}
</style>
