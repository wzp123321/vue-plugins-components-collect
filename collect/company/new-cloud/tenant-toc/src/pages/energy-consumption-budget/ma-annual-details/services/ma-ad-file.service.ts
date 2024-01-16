import { postRequest } from '@/service/request';
import { MA_AD_IExceptionItem } from '../ma-annual-details.api';
import { FBlobHandler, FResHandler, FUploadHandler, IRes, TDeepReadonly, TOKEN } from './services.api';
import message from '@/utils/message';

// 后台接口地址
const enum EPath {
  导出年度详情表格数据 = '/allStageBudget/exportExcelAllStageBudget',
  下载年度明细模板 = '/allStageBudget/exportExcelAllStageBudgetTemplate',
  批量导入年度明细模板 = '/allStageBudget/uploadExcelAllStageBudget',
}

// 允许的文件格式
const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
const MAXIMUN_SIZE = 10; // 文件大小限制 -MB

/**
 * 文件服务
 * @description 实现年度明细表下载、导入、导出相关支撑服务
 * @default FileService 文件服务（单例模式）
 */
class FileService {
  private _downloading = false;
  private _importing = false;
  private _exporting = false;
  private _data: { exceptions?: Array<MA_AD_IExceptionItem> } = {};

  //#region 状态
  public get isDownloading(): boolean {
    return this._downloading;
  }

  public get isImporting(): boolean {
    return this._importing;
  }

  public get isExporting(): boolean {
    return this._exporting;
  }
  //#endregion

  // 导出异常信息
  public get exceptions(): TDeepReadonly<Array<MA_AD_IExceptionItem>> {
    return this._data.exceptions ?? [];
  }

  public clear(): void {
    this._data = {};
  }

  public async download(): Promise<boolean> {
    const messageInstance = message.loading('正在下载');

    try {
      this._downloading = true;
      const res: Blob = await postRequest(EPath.下载年度明细模板, TOKEN, { responseType: 'blob' });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '年度明细模板.xlsx';
      await FBlobHandler(res, name);
      message.success('下载成功');
      return true;
    } catch (error) {
      console.warn('下载年度明细模板', '-->', error);
      message.error(`下载失败，${error}`);
      return false;
    } finally {
      this._downloading = false;
      messageInstance.close();
    }
  }

  public async import(): Promise<boolean> {
    const file = await FUploadHandler(Object.keys(ACCEPT_EXTENSIONS).join());
    if (!this.verifyUpload(file)) {
      return false;
    }

    const messageInstance = message.loading('正在导入');
    try {
      this._data.exceptions = undefined;
      this._importing = true;
      const body = new FormData();
      Object.entries(TOKEN).forEach(([k, v]) => body.append(k, v.toString()));
      body.append('file', file);
      const res: IRes<Array<IErrorItem>> = await postRequest(EPath.批量导入年度明细模板, body);
      const data = FResHandler(res);
      if (data?.length) {
        this._data.exceptions = data;
        return false;
      } else {
        message.success('导入成功');
        return true;
      }
    } catch (error) {
      console.warn('批量导入年度明细模板', '-->', error);
      message.error(`导入失败，${error}`);
      return false;
    } finally {
      this._importing = false;
      messageInstance.close();
    }
  }

  public async export(): Promise<boolean> {
    const messageInstance = message.loading('正在导出');

    try {
      this._exporting = true;
      const res: Blob = await postRequest(EPath.导出年度详情表格数据, TOKEN, { responseType: 'blob' });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '年度明细表.xlsx';
      await FBlobHandler(res, name);
      message.success('导出成功');
      return true;
    } catch (error) {
      console.warn('导出年度详情表格数据', '-->', error);
      if (error && typeof error === 'string') {
        message.error(`导出失败，${error}`);
      }
      return false;
    } finally {
      this._exporting = false;
      messageInstance.close();
    }
  }

  private verifyUpload(target: File): boolean {
    if (target?.size > MAXIMUN_SIZE * 1024 * 1024) {
      message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${MAXIMUN_SIZE}MB！`);
      return false;
    }

    const suffix = target?.name?.substring(target?.name?.lastIndexOf('.'));
    if (!Object.keys(ACCEPT_EXTENSIONS).includes(suffix)) {
      message.error(
        `上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(ACCEPT_EXTENSIONS).join('/')}格式文件！`,
      );
      return false;
    }

    return true;
  }
}
export default new FileService();

interface IErrorItem {
  detail: string;
  position: string;
}
