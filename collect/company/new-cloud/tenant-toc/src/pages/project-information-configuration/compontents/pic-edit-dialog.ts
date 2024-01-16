import { defineComponent, reactive, ref, computed, nextTick } from 'vue';
import { ElForm } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { onFileUpload } from '@/utils/upload';
import { getImageFileFromUrl } from '@/utils/index';

// components
import projectInformationConfigurationService from '../services/project-information-configuration.service';

export default defineComponent({
  name: 'picEditDialog',
  props: ['rows', 'emsVersionList'],
  components: { Plus, Delete },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm); // 表单 ref
    const uploadImgRef = ref(); // 上传 获取input框ref
    const picEditDialogform = reactive<ProjectInformationConfigurationList.EditDialogForm>({
      emsAddress: '',
      emsVersion: '',
      uploadLogo: undefined,
      picEditDialogVisible: false,
    });
    let imgFile: any; // 上传图片 file
    const tenantCode = ref<string>('');
    const tenantId = ref<number>();
    const imgName = ref<string>('');
    const isShowDel = ref<boolean>(false);
    const rows = computed(() => {
      return props.rows ? props.rows : '';
    });
    const emsVersionList = computed(() => {
      return props.emsVersionList ? props.emsVersionList : [];
    });
    // 表单校验
    const rules = {
      // uploadLogo: [{ required: true, message: '请选择图片', trigger: 'change' }],
      emsVersion: [{ required: true, message: '请输入版本', trigger: 'change' }],
    };
    const querySingleTenantConfig = async (code: string, id: number, fileName: string) => {
      tenantCode.value = code;
      tenantId.value = id;
      imgName.value = fileName;
      try {
        const obj = {
          tenantCode: code,
          tenantId: id,
        };
        const res = await projectInformationConfigurationService.querySingleTenantConfig(obj);
        if (res && res.code === 200 && res.success) {
          // formData.value = res.data;
          picEditDialogform.uploadLogo = res.data.logoUrl === null ? '' : res.data.logoUrl;
          picEditDialogform.emsAddress = res.data.emsHost === null ? '' : res.data.emsHost;
          picEditDialogform.emsVersion = res.data.emsVersion === null ? '' : res.data.emsVersion;
          code = res.data.tenantCode;
          id = res.data.tenantId;
        } else {
          picEditDialogform.uploadLogo = '';
          picEditDialogform.emsAddress = '';
          picEditDialogform.emsVersion = '';
        }
        show();
      } catch (error) {
        show();
      }
    };
    // 显示
    const show = () => {
      picEditDialogform.picEditDialogVisible = true;
      // const uploadLogoDom = <HTMLImageElement>document.querySelector('.uploadLogo-uploader__container');
      // if (uploadLogoDom !== null) {
      //   uploadLogoDom.style.border = '1px dashed #d9d9d9';
      // }
    };
    // 选择图片按钮事件
    const chooseImg = () => {
      uploadImgRef.value.dispatchEvent(new MouseEvent('click'));
    };
    // 打开文件资源 选择文件
    const beforeAvatarUpload = async (file: File) => {
      // imgFile = file;

      // 检查类型
      const types = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!types.includes(file.type)) {
        proxy.$message.warning('上传图片只能是 JPG、JPEG、PNG 格式!');
        return false;
      }
      //  检查大小
      const maxSize = 5 * 1024 * 1024;
      if (maxSize < file.size) {
        proxy.$message.warning('图片大小最大不能超过5M');
        return false;
      }
      if (file) {
        picEditDialogform.uploadLogo = await onFileUpload(file);
        imgFile = file;
        // nextTick(() => {
        //   const errorDom = <HTMLImageElement>document.querySelector('.uploadLogo .el-form-item__error');
        //   if (errorDom !== null) {
        //     const uploadLogoDom = <HTMLImageElement>document.querySelector('.uploadLogo-uploader__container');
        //     if (uploadLogoDom !== null) {
        //       uploadLogoDom.style.border = '1px dashed #d9d9d9';
        //     }
        //     errorDom.style.display = 'none';
        //   }
        // });
        return false;
      }
    };

    // 鼠标移入事件(用图片就显示删除蒙板层)
    const onMouseOver = () => {
      if(picEditDialogform.uploadLogo){
        isShowDel.value = true;
      }
    };

    // 鼠标移出事件(将删除蒙板层隐藏)
    const onMouseOut = () => {
      isShowDel.value = false;
    };

    // 删除图片
    const handleRemove = () => {
      picEditDialogform.uploadLogo = '';
      imgFile = undefined;
    };

    // 提交
    const onSubmit = () => {
      let flag;
      //   验证表单规则
      ruleForm.value.validate(async (valid: boolean) => {
        if (valid) {
          flag = true;
        } else {
          // if (picEditDialogform.uploadLogo === '') {
          //   nextTick(() => {
          //     const errorDom = <HTMLImageElement>document.querySelector('.uploadLogo .el-form-item__error');
          //     if (errorDom !== null) {
          //       const uploadLogoDom = <HTMLImageElement>document.querySelector('.uploadLogo-uploader__container');
          //       if (uploadLogoDom !== null) {
          //         uploadLogoDom.style.border = '1px dashed #f56c6c';
          //       }
          //     }
          //   });
          // }
          return false;
        }
        if (flag) {
          try {
            if (picEditDialogform.uploadLogo && imgFile === undefined) {
              imgFile = await getImageFileFromUrl(picEditDialogform.uploadLogo, imgName.value);
            }
            const form: any = new FormData(); // FormData 对象
            if (picEditDialogform.uploadLogo !== '') {
              form.append('imageFile', imgFile); // 文件对象
            }
            form.append('emsHost', picEditDialogform.emsAddress); // 文件对象
            form.append('emsVersion', picEditDialogform.emsVersion); // 文件对象
            form.append('tenantCode', tenantCode.value); // 文件对象
            form.append('tenantId', tenantId.value); // 文件对象
            const res = await projectInformationConfigurationService.updateTenantConfig(form);
            if (
              (res && res.data && res.data.code === 200 && res.data.success) ||
              (res && res.code === 200 && res.success)
            ) {
              picEditDialogform.picEditDialogVisible = false;
              context.emit('picEditOK');
              return proxy.$message.success(res.message);
            } else {
              picEditDialogform.picEditDialogVisible = true;
              return proxy.$message.error(res.message);
            }
          } catch (error) {
            picEditDialogform.picEditDialogVisible = true;
            return proxy.$message.error('编辑失败');
          }
        }
      });
    };

    // 关闭弹框
    const cancel = () => {
      ruleForm.value.resetFields();
      picEditDialogform.picEditDialogVisible = false;
      picEditDialogform.emsAddress = '';
      picEditDialogform.emsVersion = '';
      picEditDialogform.uploadLogo = '';
    };
    // 因没有上传图片的接口 故用http-request覆盖掉action的url 否则会默认生成个上传地址报404 但不影响代码运行
    const noHelp = () => {};
    return {
      picEditDialogform,
      rules,
      uploadImgRef,
      rows,
      ruleForm,
      imgFile,
      emsVersionList,
      isShowDel,
      show,
      onSubmit,
      cancel,
      chooseImg,
      beforeAvatarUpload,
      querySingleTenantConfig,
      noHelp,
      handleRemove,
      onMouseOver,
      onMouseOut,
    };
  },
});
