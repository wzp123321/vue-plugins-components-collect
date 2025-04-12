import { ICommonFileUploadErrorDetail, ICommonRes } from '@/services/common.api';
import { FResHandler } from '@/utils';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { ref } from 'vue';

interface FileUploadResponse {
  success: boolean;
  detailList: ICommonFileUploadErrorDetail[];
}

interface FileUploadErrorRes {
  errorMessageList: ICommonFileUploadErrorDetail[];
  successFlag: number;
}

export const useFileImport = () => {
  // 导入
  const importing = ref(false);
  /**
   * 文件上传处理
   * @param accept 允许的后缀
   * @returns 目标文件域
   */
  const handleFileChoose = (accept?: string): Promise<File> =>
    new Promise((resolve, reject) => {
      const element = document.createElement('input');
      element.type = 'file';
      if (accept) {
        element.accept = accept;
      }
      element.click();
      element.onchange = () => {
        const file = element.files?.[0];
        if (file?.size) {
          resolve(file);
        } else {
          reject(new Error('无法选取文件'));
        }
        element.remove();
      };
    });
  // 校验文件
  const verifyUploadFile = (target: File, maxSize: number, accept: { [key: string]: string }): boolean => {
    if (target?.size > maxSize * 1024 * 1024) {
      message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${maxSize}MB！`);
      return false;
    }
    const suffix = target?.name?.substring(target?.name?.lastIndexOf('.'));
    if (!Object.keys(accept).includes(suffix)) {
      message.error(`上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(accept).join('/')}格式文件！`);
      return false;
    }
    return true;
  };
  /**
   * 文件上传
   * @param {string} path 上传接口地址
   * @param {File} file 文件
   * @param {{ [key: string]: any }} params 参数
   * @returns {Promise<FileUploadResponse> }
   */
  const handleFileUpload = async (
    path: string,
    file: File,
    params?: { [key: string]: any },
  ): Promise<FileUploadResponse> => {
    message.loading('文件上传中');
    try {
      importing.value = true;
      const formData = new FormData();
      formData.append('file', file);
      if (params) {
        Object.entries(params)?.forEach(([k, v]) => {
          formData.append(k, v);
        });
      }
      const res: ICommonRes<FileUploadErrorRes> = await axios.post(path, formData);
      const data = FResHandler(res);
      console.log(res);
      if (Array.isArray(data?.errorMessageList) && data?.errorMessageList?.length > 0) {
        return {
          success: false,
          detailList: data?.errorMessageList,
        };
      }
      message.success('导入成功');
      return {
        success: true,
        detailList: [],
      };
    } catch (error) {
      console.warn('批量导入年度明细模板', '-->', error);
      message.error(`导入失败，${error}`);
      return {
        success: false,
        detailList: [],
      };
    } finally {
      importing.value = false;
    }
  };
  return {
    importing,
    handleFileChoose,
    verifyUploadFile,
    handleFileUpload,
  };
};
