/*
 * @Description: 按钮
 * @Autor: zpwan
 * @Date: 2022-04-19 10:49:51
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-30 16:19:04
 */
import { ref } from 'vue';
import message from '@/utils/message';
import Deffer, { getTenant, formatDateStamp } from '@/utils/index';
import { verifyUpload } from '../utils/index';

import { FileDownloadService } from '@/service/common.filedownload.service';
import { FUploadHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import hhnEntryService from '@/pages/management-analysis/ma-householdnumber-entry/services/ma-householdnumber-entry.service';
import { FORBIDDEN_CODES } from '@/config';

// 允许的文件格式
const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
};
const MAXIMUN_SIZE = 10; // 文件大小限制 -MB
const DOWNLOAD_TEMPLATE_URL = '/tenant/account/data/download';
const MAXIMUN_TOTAL_SIZE = 100; // 总大小

const downloadService = new FileDownloadService();

class MaButtonBarService {
  //#region
  private _is_importing = ref<boolean>(false);
  private _is_downloading = ref<boolean>(false);
  private _date = ref<any[]>([]);
  private _visible = ref<boolean>(false); // 导出选择时间
  private _importVisible = ref<boolean>(false); // 导入错误数据弹框
  private _errorDataSource = ref<NHouseholdNumber.ImportExceptionVO[]>([]);
  //#endregion

  //#region
  public get is_importing(): boolean {
    return this._is_importing.value;
  }
  public get is_downloading(): boolean {
    return this._is_downloading.value;
  }
  public get date(): Date[] {
    return this._date.value;
  }
  public set date(value: Date[]) {
    this._date.value = value;
  }
  public get importVisible(): boolean {
    return this._importVisible.value;
  }
  public set importVisible(value: boolean) {
    this._importVisible.value = value;
  }
  public get errorDataSource(): NHouseholdNumber.ImportExceptionVO[] {
    return this._errorDataSource.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }
  public get visible(): boolean {
    return this._visible.value;
  }
  //#endregion
  show = () => {
    this._visible.value = true;
    this._date.value = [];
  };
  close = () => {
    this._visible.value = false;
  };
  // 下载
  download = () => {
    if (!this._date.value || this._date.value?.length === 0) {
      message.error('请选择日期！');
      return;
    }
    if (this._is_downloading.value) {
      return;
    }
    this._is_downloading.value = true;
    downloadService.type = '下载';
    downloadService.url = DOWNLOAD_TEMPLATE_URL;
    downloadService.params = {
      ...getTenant(),
      startDate: formatDateStamp(this._date.value[0].getTime(), 'YYYY-MM'),
      endDate: formatDateStamp(this._date.value[1].getTime(), 'YYYY-MM'),
    };
    downloadService.download(
      downloadService.params,
      () => {
        this._is_downloading.value = false;
      },
      () => {
        this._is_downloading.value = false;
      },
    );
    this._visible.value = false;
  };

  // 模板导入
  fileImport = async () => {
    const deffer = new Deffer();
    const file = await FUploadHandler(Object.keys(ACCEPT_EXTENSIONS).join());
    if (!verifyUpload([], file, MAXIMUN_SIZE, ACCEPT_EXTENSIONS, MAXIMUN_TOTAL_SIZE)) {
      return false;
    }
    this._is_importing.value = true;
    const messageInstance = message.loading('正在导入');
    try {
      const tenant = getTenant();
      const formData = new FormData();
      formData.append('tenantId', tenant.tenantId + '');
      formData.append('tenantCode', tenant.tenantCode);
      formData.append('file', file);
      const res = await hhnEntryService.getDataImport(formData);
      if (res && res.code === 200 && res.success) {
        if (res.data?.length) {
          this._errorDataSource.value = res.data;
          this._importVisible.value = true;
          deffer.resolve(false);
        } else {
          deffer.resolve(true);
          message.success('导入成功！');
        }
      } else {
        deffer.resolve(false);
        message.error(res.message);
      }
    } catch (error: any) {
      deffer.resolve(false);
      if (!FORBIDDEN_CODES?.includes(error?.status)) {
        message.error('导入失败！');
      }
    } finally {
      messageInstance.close();
      this._is_importing.value = false;
    }
    return deffer.promise;
  };
  // 关闭错误数据弹框
  errorDialogClose = () => {
    this._importVisible.value = false;
    this._errorDataSource.value = [];
  };
}

const heButtonBar = new MaButtonBarService();

export default heButtonBar;
