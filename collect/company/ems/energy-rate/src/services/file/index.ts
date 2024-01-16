import { Common_EFileDownloadType, Common_IObject } from './../../services/api/index';
import { postRequest } from '../../services/request';
import message from '../../utils/message';

export interface IRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * 二进制响应处理
 * @param blob 二进制流
 * @param name 输出文件名
 */
export function useFileBlobHandler(blob: Blob, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (blob.size) {
      const reader = new FileReader();

      if (blob.type.includes('json')) {
        reader.onloadend = (e) => {
          const res: IRes<void> = JSON.parse(e.target?.result as string);
          reject(res?.message ?? '未知原因');
        };
        reader.readAsText(blob);
      } else {
        reader.onloadend = (e) => {
          useFileDownLoadHandler(e.target?.result as string, name)
            .then(() => resolve())
            .catch((error) => reject(error));
        };
        reader.readAsDataURL(blob);
      }
    } else {
      reject(`无法获取${name || '文件'}`);
    }
  });
}

/**
 * 文件下载处理
 * @param url 源路径
 * @param name 输出文件名
 */
export function useFileDownLoadHandler(url: string, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (url) {
      const element = document.createElement('a');
      element.href = url;
      name && (element.download = name);
      element.click();
      resolve();
      element.remove();
    } else {
      reject(`无法下载${name || '文件'}`);
    }
  });
}

/**
 * 文件上传处理
 * @param accept 允许的后缀  eg:'.xls,.xlsx'
 * @returns 目标文件域
 */
export function useFileUploadHandler(multiple: boolean = false, accept?: string): Promise<File | FileList> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('input');
    element.type = 'file';
    accept && (element.accept = accept);
    element.multiple = multiple;
    element.click();
    element.onchange = () => {
      if (multiple) {
        if (element.files?.length) {
          resolve(element.files);
        } else {
          reject('无法选取文件');
        }
      } else {
        const file = element.files?.[0];
        if (file?.size) {
          resolve(file);
        } else {
          reject('无法选取文件');
        }
      }

      element.remove();
    };
  });
}

// 校验文件
export const useVerifyUpload = (target: File, maxSize: number, accept: { [key: string]: string }): boolean => {
  if (target?.size > maxSize * 1024 * 1024) {
    message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${maxSize}MB！`);
    return false;
  }
  if (!Object.values(accept).includes(target?.type)) {
    message.error(`上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(accept).join('/')}格式文件！`);
    return false;
  }
  return true;
};

/**
 * 文件上传
 * @param params 入参
 * @param uploadUrl 地址
 * @param headerOptions 请求头配置
 * @returns
 */
export const useFileUpload = <T>(params: T, uploadUrl: string, headerOptions?: { [key: string]: string }) => {
  return new Promise(async (resolve, reject) => {
    const messageInstance = message.loading('正在导入');
    try {
      const res = await postRequest(uploadUrl, params as Common_IObject, {
        ...headerOptions,
      });
      if (res && res.code === 200 && res.success) {
        if (res.data?.length || res.data?.errorMessageList.length) {
          resolve(res.data);
        } else {
          resolve(true);
          message.success('导入成功！');
        }
      } else if (res && res.code !== 200 && !res.success && res.data === null) {
        resolve(res);
      } else {
        reject(false);
        message.error(res.message);
      }
    } catch (error) {
      reject(false);
      message.error('导入失败！');
    } finally {
      messageInstance.close();
    }
  });
};

/**
 * 下载
 * @param params  入参
 * @param downloadUrl 地址
 * @param type 类型
 * @param headerOptions 请求头配置
 * @returns
 */
export const useFileDownload = <T>(
  params: T,
  downloadUrl: string,
  type: Common_EFileDownloadType,
  headerOptions?: { [key: string]: string },
) => {
  return new Promise(async (resolve, reject) => {
    const messageInstance = message.loading(`正在${type}`);
    try {
      const res: Blob = await postRequest(downloadUrl, params as Common_IObject, {
        responseType: 'blob',
        ...headerOptions,
      });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '数据导出表.xlsx';
      // 如果是json
      if (res?.size && res?.type.includes('json')) {
        mapUploadError(type, res);
        resolve(false);
      } else {
        console.log(res);
        await useFileBlobHandler(res, name);
        message.success(`${type}成功`);
        resolve(true);
      }
    } catch (error: any) {
      if (error?.data?.size && error?.data?.type.includes('json')) {
        mapUploadError(type, error?.data);
      }
      console.warn('导出数据', '-->', error);
      reject(false);
    } finally {
      messageInstance.close();
    }
  });
};
/**
 * 处理json响应结果
 */
const mapUploadError = (type: string, res: Blob) => {
  const reader = new FileReader();
  reader.onloadend = (e) => {
    const errRes = JSON.parse(e.target?.result as string);
    if (errRes?.errmsg && typeof errRes?.errmsg === 'string' && +errRes?.errcode !== 401) {
      console.log(`%c✨✨${type}失败✨✨', 'font-size: 24px`, errRes?.errmsg);
      message.error(`${type}失败，${errRes?.errmsg}`);
    }
  };
  reader.readAsText(res);
};
