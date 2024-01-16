/*
 * @Description: 文件下载
 * @Autor: zpwan
 * @Date: 2022-04-16 17:53:18
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-09 17:43:30
 */
import { ref } from 'vue';

import { postRequest } from '@/services/request';
import { CommonObject } from './common/common-api';

import message from '../utils/message';
import { FBlobHandler } from '../utils/token';

export class FileDownloadService {
  private _url = ref<string>('');
  private _type = ref<'导出' | '下载'>('导出');
  private _params = ref();

  public get url(): string {
    return this._url.value;
  }

  public get type() {
    return this._type.value;
  }

  public get params(): CommonObject {
    return this._params.value;
  }

  constructor(type: '下载' | '导出', url: string) {
    this._type.value = type;
    this._url.value = url;
  }

  download = async <T>(params: T, errorCb: () => void, successCb: () => void) => {
    this._params.value = params;
    const messageInstance = message.loading(`正在${this._type.value}`);
    try {
      const res: Blob = await postRequest(this._url.value, params as { [key: string]: any }, {
        responseType: 'blob',
      });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '数据导出表.xlsx';
      await FBlobHandler(res, name);
      message.success(`${this._type.value}成功`);
      successCb();
    } catch (error) {
      console.warn('导出数据', '-->', error);
      message.error(`${this._type.value}失败，${error}`);
      errorCb();
    } finally {
      messageInstance.close();
    }
  };
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
export const useFileUpload = <T>(
  params: T,
  uploadUrl: string,
  headerOptions?: { [key: string]: string },
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const messageInstance = message.loading('正在导入');
    try {
      const res = await postRequest(uploadUrl, params as { [key: string]: any }, {
        ...headerOptions,
      });
      if (res && res.code === 200 && res.success) {
        if (res.data?.length || res.data?.errorMessageList?.length) {
          resolve(res?.data);
        } else {
          resolve(true);
          message.success('导入成功！');
        }
      } else {
        reject(false);
        if (res?.message) {
          message.error(res?.message);
        }
      }
    } catch (error) {
      console.log(error);
      reject(false);
      message.error('导入失败！');
    } finally {
      messageInstance.close();
    }
  });
};
