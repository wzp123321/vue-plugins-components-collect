import { ref } from 'vue';
import { request, getFileStreamDownload } from '@/utils/request';
import { TeMessage } from '@tiansu/element-plus';

export const useImport = (params: {
  importUrl?: string;
  templateCode?: string;
  downloadTemplateUrl?: string; // 新增：支持外部传入下载模板接口
  templateFileName?: string; // 新增：支持外部传入模板文件名
}) => {
  const importVisible = ref(false);
  const importPath = params.importUrl;
  const progressUrl = ref('');
  const cancelUrl = ref('');
  // 下载中
  const importing = ref(false);
  // 导入完成状态标记，用于在弹框关闭时触发刷新
  const importCompleted = ref(false);

  const downloadTemplate = () => {
    if (!importing.value) {
      importing.value = true;
      // 优先使用外部传入的下载模板接口，否则使用默认接口
      const downloadUrl = params.downloadTemplateUrl ||
        `/sec/excel/template`;

      // 优先使用外部传入的模板文件名，否则使用默认名称
      const fileName = params.templateFileName || '下载模板';

      getFileStreamDownload(
        {
          type: params.templateCode // 直接使用 templateCode 作为 type 参数
        },
        downloadUrl,
        '下载模板', // type 参数，用于显示提示信息
        () => {
          importing.value = false;
        },
        () => {
          importing.value = false;
        },
        fileName, // fileName 参数，用于设置下载的文件名
      );
    }
  };
  const handleUpload = () => {
    importVisible.value = true;
    // 重置导入完成状态
    importCompleted.value = false;
  };
  const importCallback = (res: any) => {
    console.log(res);
    const taskId = res.data;
    progressUrl.value = `/sec/excel/${taskId}/progress`;
    cancelUrl.value = `/sec/excel/${taskId}/cancelTask`;
  };
  const completeImport = (data: { failCount: number }) => {
    // 标记导入已完成
    importCompleted.value = true;
    if (data.failCount === 0) {
      TeMessage.success('导入成功');
      importVisible.value = false;
    } else {
      // 有错误数据时，弹框可能不会自动关闭，但用户可能会手动关闭
      // 这里不强制关闭弹框，让用户查看错误信息
      // 如果弹框被关闭（手动或自动），watch 会监听到并触发刷新
    }
  };
  const downLoadResult = (fileUrl: any) => {
    console.log('downLoadResult', fileUrl);
    if (!fileUrl) return;
    // slice是因为返回路径有/io,本地联调环境不需要该前缀,需根据联调情况修改该地址和路径处理方式
    const downloadUrl =
      import.meta.env.MODE === 'development'
        ? `http://192.168.50.141:10130${fileUrl.slice(3)}`
        : window.location.origin + fileUrl;
    window.open(downloadUrl);
  };
  return {
    importVisible,
    importPath,
    request,
    downloadTemplate,
    handleUpload,
    importCallback,
    progressUrl,
    cancelUrl,
    completeImport,
    downLoadResult,
    importCompleted,
  };
};
