<template>
  <div class="te-upload-imagecropping">
    <te-upload
      class="tui-upload"
      :class="{ 'tui-set-bg': imgList.length >= limit || isView }"
      :http-request="upload"
      :before-upload="beforeUpload"
      :on-success="sueecss"
      :on-error="error"
      :on-remove="remove"
      :on-preview="preview"
      list-type="picture-card"
      v-model:file-list="imgList"
      :accept="accept"
    >
      <icon-plus class="tui-set-icon" v-if="imgList.length < limit && !isView" />
    </el-upload>
    <te-dialog
      v-model="options.dialogVisible"
      title="上传登录背景"
      :width="1000"
      :destroy-on-close="true"
      @close="croperDialogClose"
    >
      <componentKey
        ref="cropper"
        style="height: 437px"
        :img="options.img"
        :infoTrue="options.infoTrue"
        :auto-crop="options.autoCrop"
        :fixedNumber="fixedNumber"
        :fixed="options.fixed"
        :centerBox="options.centerBox"
        :outputType="options.outputType"
        :full="options.full"
        :canScale="options.canScale"
        :outputSize="options.outputSize"
        :="$attrs"
      >
      </componentKey>
      <template #footer>
        <span>
          <te-button @click="previewImgCancle()">取消</el-button>
          <te-button type="primary" @click="previewImgConfirm()"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
    <te-dialog v-model="imageVisible" title="图片预览" :destroy-on-close="true">
      <te-carousel class="tui-image-preview" :autoplay="false" arrow="always" height="500px" :initial-index="1">
        <te-carousel-item v-for="item in imgList" :key="item.url">
          <img class="tui-image-preview-img" :src="item.url" text="2xl" justify="center" />
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { IconPlus } from '@arco-iconbox/vue-te/esm';
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import axios from 'axios';
import VueCropper from './vue-cropper.vue';
const componentKey = ref(null);
import {
  TeUpload,
  type UploadRawFile,
  type UploadRequestOptions,
  type UploadUserFile,
  ElDialog,
  ElButton,
  ElMessage,
  TeCarousel,
  TeCarouselItem,
} from 'element-plus';
import { UuidUtil } from '@zpackage/tools';
const emits = defineEmits(['update:fileList']);
const props = withDefaults(
  defineProps<{
    data: {};
    onSuccess: Function;
    onError: Function;
    onRemove: Function;
    onBeforeUpload?: Function;
    action: string;
    isView: boolean;
    fileList: Array<string>;
    limit: number;
    width: number;
    height: number;
    //是否开启截图
    isCropper: boolean;
    //截图宽高比
    fixedNumber: Array<number>;
    //图片大小限制
    limitSize: number;
    //覆盖默认的 Xhr 行为，允许自行实现上传文件的请求
    httpRequest: Function;
    //请求头
    headers: Object;
    //图片名称是否重新随机生成
    rename: boolean;
    //axios
    axios?: any;
    // 控制文件选择对话框中显示的文件类型
    accept: string; 
  }>(),
  {
    // 设置默认值
    fileList: () => [],
    limit: 1,
    width: 146,
    height: 146,
    isCropper: true,
    fixedNumber: null,
    rename: true,
    accept: 'image/*',
  }
);
onMounted(() => {
  const cropper = defineAsyncComponent(() => import(`./vue-cropper.vue`));
  componentKey.value = cropper;
});
// 将文件类型的图片转换为base64地址
const getBase64 = (img: File, callback: (img: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    callback(reader.result!.toString());
  });
  reader.readAsDataURL(img);
};
/**
 * 图片上传前的钩子
 * @param rawFile
 * @returns
 */
const beforeUpload = (rawFile: UploadRawFile): Promise<File> | boolean => {
  if (
    rawFile.type === 'image/jpeg' ||
    rawFile.type === 'image/png' ||
    rawFile.type === 'image/jpg' ||
    rawFile.type === 'image/gif' ||
    rawFile.type === 'image/bmp' ||
    rawFile.type === 'image/webp'
  ) {
    if (props.isCropper) {
      //返回一个裁剪图片的promise，根据裁剪弹窗的交互情况决定是否继续上传的流程；
      return new Promise<File>((resove, reject) => {
        getBase64(rawFile, (img: string) => {
          options.dialogVisible = true;
          options.img = img;
          cropperResove = resove;
          cropperReject = reject;
        });
      });
    } else {
      if (props.limitSize && rawFile.size / 1024 / 1024 > props.limitSize) {
        ElMessage.error('图片不能大于' + props.limitSize + 'MB!');
        return false;
      }
      if (props.onBeforeUpload && !props.onBeforeUpload(rawFile)) {
        return false;
      }
      if (props.rename) {
        //重命名图片
        return new Promise<File>((resove, reject) => {
          const file = new File([rawFile], UuidUtil.uuid32() + '.' + rawFile.type.split('/')[1], {
            type: rawFile.type,
          });
          resove(file);
        });
      }
      return true;
    }
  } else {
    ElMessage.error('必须是图片!');
    return false;
  }
};
/**
 * 图片上传
 * @param options
 * @returns
 */
const upload = (options: UploadRequestOptions) => {
  if (props.httpRequest) {
    return props.httpRequest(options);
  } else {
    let params = new FormData();
    params.append('file', options.file);
    params.append('module', 'hlmsFrontCard');
    params.append('isCovered', '1');
    if (props.data) {
      for (const key in props.data) {
        if (Object.prototype.hasOwnProperty.call(props.data, key)) {
          params.append(key, props.data[key]);
        }
      }
    }
    return (props.axios || axios).post(props.action ? props.action : '/hlms/api/tenant/nfs/upload', params, {
      headers: props.headers ?? {},
    });
  }

  // return new Promise((reslove) => {
  //   reslove({ errcode: '0', data: [{ addrUrl: '/img/gz.jpg' }] });
  // });
};
let imgList = ref<UploadUserFile[]>([]);
watch(
  () => props.fileList,
  (newValue, oldValue) => {
    if (newValue) {
      newValue.forEach((item, index) => {
        if (item !== imgList.value[index]?.url) {
          imgList.value.splice(index, 1, { name: UuidUtil.uuid32() + '', url: item });
        }
      });
      imgList.value.splice(newValue.length);
    } else {
      imgList.value = [];
    }
  },
  { deep: true, immediate: true }
);
/**
 * 上传成功时的回调
 * @param data 接口的返回对象
 */
const sueecss = (data: { errcode: string; errmsg: string; data: { addrUrl: string }[] }) => {
  if (props.action) {
    //如果props.action不为空，用的是传经来的上传地址，把接口返回值原样通知给外部，让外部自行处理，同时将组件内部自动生成的blob图片地址通知给外部
    let list = imgList.value.map((item) => {
      //imgList中的url默认是upload组件自动生成的blob地址
      return item.url;
    });
    emits('update:fileList', list);
    props.onSuccess && props.onSuccess(data, list);
  } else {
    //如果props.action为空，则用的是平台的默认上传地址，直接解析接口返回值并通知外部
    if (data.errcode === '0') {
      //成功
      imgList.value.splice(imgList.value.length - 1, 1, {
        name: UuidUtil.uuid32() + '',
        url: data.data[0]?.addrUrl,
      });
      let list = imgList.value.map((item) => {
        return item.url;
      });
      emits('update:fileList', list);
      props.onSuccess && props.onSuccess(data, list);
    } else {
      //上传失败
      imgList.value.splice(imgList.value.length - 1, 1);
      ElMessage.error(data.errmsg);
      props.onError && props.onError(error, props.fileList);
    }
  }
};
/**
 * 移除图片的回调
 */
const remove = () => {
  let list = imgList.value.map((item) => {
    return item.url;
  });
  emits('update:fileList', list);
  props.onRemove && props.onRemove(error, list);
};
/**
 *上传失败
 */
const error = (error: Error) => {
  ElMessage.error('上传失败!');
  props.onError && props.onError(error, props.fileList);
};
//图片大图弹出框是否显示
const imageVisible = ref(false);
/**
 * 大图预览
 */
const preview = () => {
  imageVisible.value = true;
};
/**********************裁剪图片 start*************/
//裁剪图片组件的配置
const options = reactive({
  img: '', // 需要剪裁的图片
  autoCrop: true, // 是否默认生成截图框
  outputType: 'webp', // 裁剪生成图片的格式
  canScale: false, // 图片是否允许滚轮缩放
  fixed: props.fixedNumber ? true : false, // 是否开启截图框宽高固定比例
  centerBox: true, // 截图框是否被限制在图片里面
  full: true, // 是否输出原图比例的截图
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  outputSize: 0.5, //输出图片质量0.1-1
  dialogVisible: false, //图片裁剪对话框显示标识
});

//裁剪图片的promise的resove函数
let cropperResove: Function | null = null;
//裁剪图片的promise的reject函数
let cropperReject: Function | null = null;
//截图对象
const cropper = ref();
/**
 * 裁剪图片确认
 */
const previewImgConfirm = () => {
  //获取当前裁剪框中的图片数据-blob类型
  cropper.value.getCropBlob((data: Blob) => {
    const file = new File([data], UuidUtil.uuid32() + '.' + data.type.split('/')[1], { type: data.type });
    if (props.limitSize && file.size / 1024 / 1024 > props.limitSize) {
      ElMessage.error('图片不能大于' + props.limitSize + 'MB!');
      //取消上传图片
      cropperReject && cropperReject(file);
    } else if (props.onBeforeUpload && !props.onBeforeUpload(file)) {
      cropperReject && cropperReject(file);
    } else {
      //确继续上传截图
      cropperResove && cropperResove(file);
    }
    cropperResove = cropperReject = null;
    options.dialogVisible = false;
  });
};
/**
 * 取消上传
 */
const previewImgCancle = () => {
  options.dialogVisible = false;
};
/**
 * 截图弹窗关闭事件
 */
const croperDialogClose = () => {
  //弹窗关闭时，且cropperReject不为null时，取消截图上传
  cropperReject && cropperReject();
  cropperResove = cropperReject = null;
};
/**********************裁剪图片 end*************/
</script>
<style scoped lang="less">
// @import '@zpackage/web-package/dist/styles/index.css';
.te-upload-imagecropping {
  :deep(.tui-upload) {
    .te-upload {
      width: v-bind('width+"px"');
      height: v-bind('height+"px"');
      margin: 0 8px 8px 0;
    }
    .te-upload:hover {
      border-color: var(--te-color-primary);
    }
    .te-upload-list__item {
      width: v-bind('width+2+"px"');
      height: v-bind('height+2+"px"');
    }
    .te-icon--close-tip {
      display: none !important;
    }
    .te-upload-list--picture-card .te-upload-list__item-actions .te-upload-list__item-delete {
      display: v-bind('isView?"none": "inline-flex"');
    }
  }
  :deep(.tui-set-bg) {
    .te-upload {
      width: auto;
      height: auto;
      border: none;
    }
  }
  .tui-set-icon {
    font-size: 28px;
    text-align: center;
  }
  .tui-image-preview {
    width: 100%;
    height: 500px;
    &-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
