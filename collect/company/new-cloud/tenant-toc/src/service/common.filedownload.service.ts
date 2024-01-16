/*
 * @Description: 文件下载
 * @Autor: zpwan
 * @Date: 2022-04-16 17:53:18
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-26 19:12:04
 */
import { ref } from 'vue';

import { postRequest } from '@/service/request';
import message from '@/utils/message';

import { FBlobHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import { Common_IObject } from './api';

export class FileDownloadService {
  private _url = ref<string>('');
  private _type = ref<'导出' | '下载'>('导出');
  private _params = ref();

  public get url(): string {
    return this._url.value;
  }
  public set url(value: string) {
    this._url.value = value;
  }
  public get type() {
    return this._type.value;
  }
  public set type(value: '下载' | '导出') {
    this._type.value = value;
  }
  public get params(): GeneralModule.CommonObject {
    return this._params.value;
  }
  public set params(value: GeneralModule.CommonObject) {
    this._params.value = value;
  }

  download = async (params: Common_IObject, errorCb: () => void, successCb: () => void) => {
    this._params.value = params;
    const messageInstance = message.loading(`正在${this._type.value}`);
    try {
      const res: Blob = await postRequest(this._url.value, params, {
        responseType: 'blob',
      });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '数据导出表.xlsx';
      await FBlobHandler(res, name);
      message.success('导出成功');
      successCb();
    } catch (error) {
      console.warn('导出年度详情表格数据', '-->', error);
      message.error(`导出失败，${error}`);
      errorCb();
    } finally {
      messageInstance.close();
    }
  };
}
