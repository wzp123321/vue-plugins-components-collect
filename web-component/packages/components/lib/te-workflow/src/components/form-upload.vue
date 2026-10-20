<template>
  <!-- 附件 -->
  <div class="wf-upload">
    <te-upload
      :class="[
        {
          'wf-upload-image-disabled':
            item.componentType === FormComponentTypeEnum.IMAGE &&
            (item.permission === FormFieldPermissionEnum.READ_ONLY ||
              item.fileList.length >= (item.image?.maxNumber || 9)),
        },
        { 'wf-upload-view': isView },
      ]"
      v-model:file-list="(item.fileList as UploadUserFile[])"
      :http-request="upload"
      :before-upload="beforeUpload"
      :on-success="sueecss"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :disabled="item.permission === FormFieldPermissionEnum.READ_ONLY || isView"
      :list-type="item.componentType === FormComponentTypeEnum.IMAGE ? 'picture-card' : 'text'"
    >
      <icon-plus v-if="item.componentType === FormComponentTypeEnum.IMAGE && !isView" />
      <te-button
        v-else-if="!isView"
        type="primary"
        :disabled="
          item.permission === FormFieldPermissionEnum.READ_ONLY ||
          item.fileList.length >= (item.componentType === FormComponentTypeEnum.VIDEO ? 1 : item.file?.maxNumber || 9)
        "
      >
        选择文件
      </te-button>
    </te-upload>
    <div class="wf-upload-desc">{{ getDesc }}</div>
    <te-dialog v-model="imagePreviewVisible">
      <div class="wf-upload-preview"><img w-full :src="dialogImageUrl" alt="Preview Image" /></div>
    </te-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import {
  TeUpload,
  TeButton,
  TeMessage,
  type UploadRawFile,
  TeLoading,
  type UploadRequestOptions,
  type UploadUserFile,
  TeDialog,
} from '@tiansu/element-plus';
import { IconPlus } from '@arco-iconbox/vue-te/esm';
import FormWidgetInstance from '../models/FormWidgetInstance_local';
import { FormComponentTypeEnum } from '../../../models/FormComponentTypeEnum';
import WorkflowApi from '../apis/WorkflowApi';
import { FormFieldPermissionEnum } from '../../../models/FormFieldPermissionEnum';
const props = defineProps<{ item: FormWidgetInstance; tenantId: string; axios: any; isView?: boolean }>();
onMounted(() => {});
const getDesc = computed(() => {
  if (props.item.componentType === FormComponentTypeEnum.IMAGE) {
    return '最多上传' + (props.item.image?.maxNumber || 9) + '张图片,大小不超过2MB,支持JPG、PNG、JPEG、WEBP格式';
  } else if (props.item.componentType === FormComponentTypeEnum.VIDEO) {
    return '最多上传1个视频,大小不超过' + (props.item.video?.maxSize || 10) + 'MB,支持MP4、AVI、MOV格式';
  } else if (props.item.componentType === FormComponentTypeEnum.FILE) {
    return (
      '最多上传' +
      (props.item.file?.maxNumber || 9) +
      '个文件,大小不超过100MB,支持DOC、DOCX、XLS、XLSM、XLSX、PPT、PPTX、TXT、PDF、PNG、JPG、GIF、BMP、JPEG、DWG、DXF、DWT、DWS、X_T、3DM、STL、ZIP格式'
    );
  }
});
/*****************************文件 start******************************** */
/**
 * 图片上传前的钩子
 * @param rawFile 选中的文件
 * @returns 一个等待图片处理的promise或标记
 */
const beforeUpload = (rawFile: UploadRawFile): Promise<File> | boolean => {
  let suffix = rawFile.name.slice(rawFile.name.lastIndexOf('.') + 1).toLowerCase();
  let fileTypes = [
    'doc',
    'docx',
    'xls',
    'xlsm',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'pdf',
    'png',
    'jpg',
    'gif',
    'bmp',
    'jpeg',
    'dwg',
    'dxf',
    'dwt',
    'dws',
    'x_t',
    '3dm',
    'stl',
    'zip',
  ];
  let limitSize = 100;
  if (props.item.componentType === FormComponentTypeEnum.VIDEO) {
    fileTypes = ['mp4', 'avi', 'mov'];
    limitSize = props.item.video?.maxSize || 10;
  } else if (props.item.componentType === FormComponentTypeEnum.IMAGE) {
    fileTypes = ['jpg', 'jpeg', 'png', 'webp'];
    limitSize = 2;
  }

  if (!fileTypes.includes(suffix)) {
    TeMessage.error('不支持的文件类型!');
    return false;
  }
  if (rawFile.size / 1024 / 1024 > limitSize) {
    TeMessage.error('文件不能大于' + limitSize + 'MB!');
    return false;
  }
  if (props.item.componentType === FormComponentTypeEnum.IMAGE) {
    //重命名图片
    return new Promise<File>((resove, reject) => {
      const file = new File([rawFile], new Date().getTime() + '.' + rawFile.type.split('/')[1], {
        type: rawFile.type,
      });
      resove(file);
    });
  }
  return true;
};
/**
 * 上传
 * @param options 上传请求的配置
 * @returns  上传的promise
 */
const upload = (options: UploadRequestOptions) => {
  let params = new FormData();
  params.append('file', options.file);
  params.append(
    'module',
    props.item.componentType === FormComponentTypeEnum.VIDEO
      ? 'taskVideo'
      : props.item.componentType === FormComponentTypeEnum.FILE
      ? 'taskAttachment'
      : 'taskPicture'
  );
  params.append('isCovered', '1');
  params.append('tenantId', props.tenantId);
  let loading = TeLoading.service({
    lock: true,
    text: '',
    background: 'rgba(0, 0, 0, 0.0)',
  });
  return WorkflowApi.upload(props.axios, props.tenantId, params).then(
    (data) => {
      loading && loading.close();
      if (data.errcode !== '0') {
        return Promise.reject({ errmsg: '' });
      } else {
        return data.data;
      }
    },
    (error) => {
      loading && loading.close();
      return Promise.reject({ errmsg: '' });
    }
  );
};
/**
 * 上传成功时的回调
 * @param data 接口的返回对象
 */
const sueecss = (data: { addrUrl: string; filename: string }[]) => {
  props.item.fileList.splice(props.item.fileList.length - 1, 1, {
    name: data[0].filename + '',
    url: data[0].addrUrl,
  });
  props.item.value = JSON.stringify(
    props.item.fileList.map((file) => {
      return { name: (file as UploadUserFile).name, url: (file as UploadUserFile).url };
    })
  );
  console.log('filevalue::::', props.item.value);
};
/**
 * 移除文件
 */
const handleRemove = () => {
  props.item.value = JSON.stringify(
    props.item.fileList.map((file) => {
      return { name: (file as UploadUserFile).name, url: (file as UploadUserFile).url };
    })
  );
  console.log('filevalue::::', props.item.value);
};
const imagePreviewVisible = ref(false);
const dialogImageUrl = ref('');
/**点击下载/预览文件 */
const handlePreview = (file: UploadUserFile) => {
  if (props.item.componentType === FormComponentTypeEnum.IMAGE) {
    //图片预览
    imagePreviewVisible.value = true;
    dialogImageUrl.value = encodeUri(file.url) || '';
  } else {
    //附件，视频下载
    var a = document.createElement('a');
    a.href = encodeUri(file.url);
    a.download = file.name;
    a.click();
  }
};
/**
 * 将文件的url的名称中的特殊字符进行编码
 * @param url 文件的url地址
 * @returns
 */
const encodeUri = (url: Nullable<string>) => {
  if (url) {
    let searchi = url.indexOf('?') === -1 ? url.length : url.indexOf('?');
    let li = url.lastIndexOf('/');
    return (
      url.substring(0, li + 1) + encodeURIComponent(url.substring(li + 1, searchi)) + url.substring(searchi, url.length)
    );
  } else {
    return '';
  }
};
/*****************************文件 end******************************** */
</script>
<style scoped lang="less">
.wf-upload {
  &-desc {
    margin-top: 8px;
    color: var(--te-color-info);
    font-size: var(--te-font-size-b12);
  }
  :deep(.wf-upload-preview) {
    display: flex;
    justify-content: center;
    > img {
      max-width: 600px;
      max-height: 600px;
    }
  }
}
.wf-upload-image-disabled {
  :deep {
    .te-upload {
      pointer-events: none;
    }
    .te-upload-list--picture-card::after {
      content: '';
      cursor: no-drop;
      width: 148px;
      position: absolute;
      height: 148px;
      right: 0;
    }
  }
}
.wf-upload-view {
  :deep {
    .te-upload {
      display: none;
    }
  }
}
</style>
