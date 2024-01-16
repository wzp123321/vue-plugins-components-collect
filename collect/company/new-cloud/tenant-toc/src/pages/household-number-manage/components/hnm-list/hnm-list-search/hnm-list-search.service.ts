import { FORBIDDEN_CODES } from '@/config';
import { FUploadHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import { FileDownloadService } from '@/service/common.filedownload.service';
import Deffer, { formatDateStamp, getTenant } from '@/utils';
import message from '@/utils/message';
import { ref } from 'vue';
import { verifyUpload } from '../../hnm-data/utils';
import { postRequest } from '@/service/request';
import { EPath } from './hnm-list-search.api';

// 允许的文件格式
const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
};
const MAXIMUN_SIZE = 10; // 文件大小限制 -MB
const DOWNLOAD_TEMPLATE_URL = '/tenantAccount/template/download';
const MAXIMUN_TOTAL_SIZE = 100; // 总大小

const downloadService = new FileDownloadService();

class HnmListSearchService {
  // 正在导入
  private _is_importing = ref<boolean>(false);
  public get is_importing(): boolean {
    return this._is_importing.value;
  }

  // 正在下载
  private _is_downloading = ref<boolean>(false);
  public get is_downloading(): boolean {
    return this._is_downloading.value;
  }

  // 导入错误数据弹框
  private _importVisible = ref<boolean>(false);
  public get importVisible(): boolean {
    return this._importVisible.value;
  }
  public set importVisible(value: boolean) {
    this._importVisible.value = value;
  }

  //导入错误提示数据
  private _errorDataSource = ref<NHouseholdNumber.ImportExceptionVO[]>([]);
  public get errorDataSource(): NHouseholdNumber.ImportExceptionVO[] {
    return this._errorDataSource.value;
  }

  /**
   * 下载
   * @returns
   */
  download = () => {
    if (this._is_downloading.value) {
      return;
    }
    this._is_downloading.value = true;
    downloadService.type = '下载';
    downloadService.url = DOWNLOAD_TEMPLATE_URL;
    downloadService.params = {
      ...getTenant(),
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
      const res: HttpRequestModule.ResTemplate<NHouseholdNumber.ImportExceptionVO[]> = await postRequest(
        EPath.导入数据,
        formData,
      );
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

export default new HnmListSearchService();
