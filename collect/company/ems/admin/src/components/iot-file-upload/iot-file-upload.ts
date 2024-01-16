import { defineComponent, computed, ref, watch } from 'vue';
import { onFileUpload } from '../../utils/upload';
import useCurrentInstance from '../../utils/use-current-instance';
export default defineComponent({
  name: 'IotFileUpload',
  props: {
    // 文件地址
    imageUrl: {
      type: String,
      default: '',
    },
    // 支持的后缀名
    extension: {
      type: String,
      default: '.jpg,.png',
    },
    // 是否需要自定义内容
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let selectFile = ref<File>(new File([], '', undefined));
    const isCustom = computed(() => {
      return props.isCustom;
    });
    const extension = computed(() => {
      return props.extension;
    });
    // 文件上传地址
    const imageUrl = ref<string>('');
    watch(
      () => props.imageUrl,
      (newVal: string) => {
        imageUrl.value = newVal;
      }
    );
    /**
     * 文件上传前
     */
    const beforeAvatarUpload = async (file: File) => {
      const ext = file.name.substring(
        file.name.lastIndexOf('.'),
        file.name.length
      );
      if (!extension.value.includes(ext)) {
        return proxy.$message.error('请选择jpg、png类型的图片');
      }

      const sizeLimit = file.size / 1024 / 1024 < 5;
      if (!sizeLimit) {
        return proxy.$message.error('图片上传最大为5M');
      }
      selectFile.value = file;
      console.log(selectFile.value, 'selectFile.value');
      imageUrl.value = await onFileUpload(file, props.extension);
      context.emit('uploadFile', file);
      return false;
    };
    // 因没有上传图片的接口 故用http-request覆盖掉action的url 否则会默认生成个上传地址报404 但不影响代码运行
    const noHelp = () => {};
    return {
      imageUrl,
      isCustom,
      extension,
      selectFile,
      beforeAvatarUpload,
      noHelp,
    };
  },
});
