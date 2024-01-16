import { defineComponent, reactive, ref, watch } from 'vue';
import { ElUpload, ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import reportManagement from '../services/report-management.service';
import { specialCharacters } from '@/config/config';
import message from '@/utils/message';
interface formType {
  fileType: string;
}
interface paramsType {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
export default defineComponent({
  name: 'reportDownloadDialog',
  props: ['dialogAdd', 'typeList'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const uploadRef = ref(ElUpload);
    const formRef = ref(ElForm);
    const clearFile = ref(); // 获取input框ref
    const fileNameCheck = ref<paramsType[]>([]); // 选择文件列表FileList转化可用数组方法
    const fileName = ref<paramsType[]>([]); // 选择文件列表FileList
    const fileNameList = ref<paramsType[]>([]); // 上传列表
    const fileList = ref<paramsType[]>([]);
    const dialogFormVisible = ref<boolean>();
    const totalSize = 100 * 1024 * 1024;
    const uploadLoading = ref<boolean>(false);
    dialogFormVisible.value = props.dialogAdd;

    watch(
      () => props.dialogAdd,
      newVal => {
        dialogFormVisible.value = newVal;
      },
    );
    const form = reactive<formType>({
      fileType: props.typeList.length > 0 ? props.typeList[0].code : '',
    });
    // 表单提交
    const onSubmit = async () => {
      fileNameList.value.forEach(item => {
        sizeSum += item.size;
      });
      if (sizeSum > totalSize) {
        sizeSum = 0;
        return proxy.$message.error('本次上传文件总体积最大不能超过100MB！');
      }
      importData(fileNameList.value, form.fileType);
    };

    // 取消
    const onClose = () => {
      fileNameList.value = [];
      dialogFormVisible.value = false;
      form.fileType = props.typeList.length > 0 ? props.typeList[0].code : '1';
    };

    // 清空
    const onEmpty = () => {
      fileNameList.value = [];
      sizeSum = 0;
    };
    // 点击导入事件 自动触发点击input框
    const importDatas = () => {
      clearFile.value.dispatchEvent(new MouseEvent('click'));
    };
    let sizeSum = 0;
    let fileNameCheckNameList: string[] = [];
    let fileNameListNameList: string[] = [];

    // 打开文件资源 选择文件
    const getFile = async (event: any) => {
      fileName.value = event.target.files;
      fileNameCheck.value = Array.from(fileName.value);
      fileNameCheck.value = fileNameCheck.value;
      // fileNameList.value = fileNameList.value.concat(fileNameCheck.value);
      if (fileNameCheck.value.length > 0) {
        fileNameCheckNameList = fileNameCheck.value.map(item => {
          return item.name;
        });
        fileNameListNameList = fileNameList.value.map(item => {
          return item.name;
        });
        // let sameNameList: string[] = []; // 上传相同文件与上传列表相同文件list
        // sameNameList = fileNameListNameList.filter(val => {
        //   return fileNameCheckNameList.indexOf(val) > -1;
        // });
        let file_typename = ''; // 后缀名
        const maxSize = 10 * 1024 * 1024; //  检查大小,单个文件大小不能超过10M

        fileNameCheck.value.some((item: any, index: number) => {
          // 文件名特殊字符
          const nameList = item.name.split('');
          let intersectionList: string[] = [];
          intersectionList = specialCharacters.filter(val => {
            return nameList.indexOf(val) > -1;
          });
          // 后缀名
          file_typename = item.name.substring(item.name.lastIndexOf('.'));
          if (
            file_typename === '.xlsm' ||
            file_typename === '.xls' ||
            file_typename === '.xlsx' ||
            file_typename === '.doc' ||
            file_typename === '.docx' ||
            file_typename === '.pdf'
          ) {
            // 检查文件大小
            if (item.size > maxSize) {
              fileNameCheck.value = [];
              return proxy.$message.error('单个文件大小最大不能超过10M！');
            } else {
              if (intersectionList.length > 0) {
                fileNameCheck.value = [];
                return proxy.$message.error('文件名含特殊字符！');
              } else {
                // if (sameNameList.length > 0) {
                //   fileNameCheck.value = [];
                //   return proxy.$message.error(
                //     `文件【${sameNameList.join(
                //       ',',
                //     )}】已添加至上传序列，请勿重复添加！`,
                //   );
                // } else {
                if (item.name.length > 60) {
                  fileNameCheck.value = [];
                  return proxy.$message.error('文件名总长度不超过60个字符，包括扩展名！');
                } else {
                  fileNameCheck.value = fileNameCheck.value;
                }
                // }
              }
            }
          } else {
            fileNameCheck.value = [];
            return proxy.$message.error('请选择正确的文件类型！');
          }
        });
        fileNameList.value = fileNameList.value.concat(fileNameCheck.value);
      }
      clearFile.value.value = null;
    };
    const importData = async (params: paramsType[], type: string) => {
      try {
        uploadLoading.value = true;
        message.loading('正在上传');
        const form: any = new FormData(); // FormData 对象
        params.forEach((item: paramsType) => {
          return form.append('files', item); // 文件对象
        });
        form.append('reportType', type); // 文件对象
        const res = await reportManagement.uploadReportData(form);
        if (
          (res && res.data && res.data.code === 200 && res.data.success) ||
          (res && res.code === 200 && res.success)
        ) {
          dialogFormVisible.value = false;
          proxy.$message.success(res.message || '上传成功');
          context.emit('uploaddOK');
          fileNameList.value = [];
          uploadLoading.value = false;
          sizeSum = 0;
        } else {
          if (!(String(res?.code).includes('4f') || String(res?.code) === '401')) {
            proxy.$message.error(res?.message || '上传失败');
          }
          dialogFormVisible.value = true;
          uploadLoading.value = false;
          sizeSum = 0;
        }
      } catch (error) {
        console.log(error);
        dialogFormVisible.value = true;
        proxy.$message.error('上传失败');
        uploadLoading.value = false;
        sizeSum = 0;
      }
    };

    // 删除文件
    const deleteFile = (index: number) => {
      fileList.value = Array.from(fileNameList.value);
      fileList.value.splice(index, 1);
      fileNameList.value = fileList.value;
      clearFile.value.value = null;
    };

    // fileList鼠标经过事件
    const onMouseoverAsync = (index: number) => {
      const fileItemMouseover = <HTMLImageElement>document.querySelector(`.file-item-bgc${index}`);
      fileItemMouseover.style.backgroundColor = 'rgba(230,247,255)';
    };

    // fileList鼠标移出事件
    const onMouseoutAsync = (index: number) => {
      const fileItemMouseout = <HTMLImageElement>document.querySelector(`.file-item-bgc${index}`);
      fileItemMouseout.style.backgroundColor = 'rgba(245, 245, 245)';
    };
    return {
      dialogFormVisible,
      form,
      uploadRef,
      formRef,
      clearFile,
      fileNameList,
      fileList,
      uploadLoading,
      onSubmit,
      onClose,
      getFile,
      importDatas,
      deleteFile,
      onMouseoverAsync,
      onMouseoutAsync,
      onEmpty,
    };
  },
});
