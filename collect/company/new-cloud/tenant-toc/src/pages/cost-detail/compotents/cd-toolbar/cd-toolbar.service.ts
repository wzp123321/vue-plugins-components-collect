import { ref } from 'vue';

import { postRequest } from '@/service/request';
import { isJsonString } from '../../../../core/token/token';
import { formatDate } from '@/utils/index';
import { ElMessage } from 'element-plus';
import message from '@/utils/message';

import { FResHandler, FUploadHandler, IRes } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import { CD_IExceptionItem, CD_IImportPageRes } from './cd-toolbar.api';
import { CD_ETableSize } from '../../cost-detail.api';
import { SCREEN_STORAGE_KEY } from '../cd-table/cd-t-screen/cd-t-screen.api';
import { FORBIDDEN_CODES } from '@/config';

// 后台接口地址
const enum EPath {
  导入SAP数据 = '/financialData/import',
  编辑统计截止时间 = '/business/analyse/statistics/cutoffTime/edit',
  查询统计截止时间 = '/business/analyse/statistics/cutoffTime/query',
}

// 允许的文件格式
const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
const MAXIMUN_SIZE = 100; // 文件大小限制 -MB

/**
 * 文件服务
 * @description 实现导入支撑服务
 * @default FileService 文件服务（单例模式）
 */
class ToolbarService {
  //#region
  private _importing = ref<boolean>(false);
  private _visible = ref<boolean>(false);
  private _exceptions = ref<CD_IExceptionItem[]>([]);
  private _statisticsDate = ref<Date | null>(null);
  private _sizeType = ref<string>(CD_ETableSize.默认);
  private _filterFlag = ref<boolean>(false);
  //#endregion
  //#region 状态
  public get isImporting(): boolean {
    return this._importing.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get exceptions(): CD_IExceptionItem[] {
    return this._exceptions.value;
  }

  public get statisticsDate(): Date | null {
    return this._statisticsDate.value as Date;
  }

  public set statisticsDate(value: Date | null) {
    this._statisticsDate.value = value;
  }

  public get sizeType(): string {
    return this._sizeType.value;
  }

  public get filterFlag(): boolean {
    return this._filterFlag.value;
  }

  public set filterFlag(value: boolean) {
    this._filterFlag.value = value;
  }
  //#endregion

  // 需要每次加载都调用
  public init() {
    if (
      window.localStorage.getItem(SCREEN_STORAGE_KEY) &&
      isJsonString(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string)
    ) {
      const obj = JSON.parse(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string);
      const flag = Object.values(obj)?.some((item: any) => {
        return item?.isActive;
      });
      console.log('获取缓存，判断是否有筛选条件');
      this._filterFlag.value = flag;
    }
  }

  public async queryStatusticsDate() {
    console.log('查询统计截止时间');
    try {
      const res = await postRequest(EPath.查询统计截止时间);
      if (res && res?.data) {
        this._statisticsDate.value = new Date(res?.data);
      } else {
        this._statisticsDate.value = null;
      }
    } catch (error) {
      this._statisticsDate.value = null;
    }
  }
  public async handleDateChange() {
    try {
      let statisticsCutoffTime: string | null = formatDate(this._statisticsDate.value, 'yyyy-MM');
      statisticsCutoffTime = statisticsCutoffTime === '--' ? null : statisticsCutoffTime;
      const res = await postRequest(EPath.编辑统计截止时间, {
        statisticsCutoffTime,
      });
      if (res && res?.data) {
        message.success(res?.message ?? '操作成功');
      } else {
      }
    } catch (error: any) {
      if (!FORBIDDEN_CODES?.includes(error?.status)) {
        message.error('操作失败');
      }
      console.log('切换统计截止时间Error============================', error);
    }
  }

  public import(): Promise<CD_IImportPageRes> {
    return new Promise(async (resolve, reject) => {
      const file = await FUploadHandler(Object.keys(ACCEPT_EXTENSIONS).join());
      if (!this.verifyUpload(file)) {
        reject(-1);
        return;
      }
      const message = ElMessage({
        message: '正在导入',
        duration: 0,
        customClass: 'cd-message',
        appendTo: document.getElementById('cost-detail') || undefined,
      });

      try {
        this._exceptions.value = [];
        this._importing.value = true;
        const body = new FormData();
        body.append('file', file);
        const res: IRes<Array<CD_IExceptionItem> | CD_IImportPageRes> = await postRequest(EPath.导入SAP数据, body);
        const data = FResHandler(res);
        if (res?.code === 200 && Array.isArray(data)) {
          this._exceptions.value = data ?? [];
          this._visible.value = true;
          reject({ pageNum: -1, comment: '', lineIndex: -1 });
        } else {
          ElMessage.success(((data as CD_IImportPageRes)?.comment as string) ?? '导入成功');
          resolve(data as CD_IImportPageRes);
        }
      } catch (error) {
        console.warn('导入SAP数据', '-->', error);
        if (typeof error === 'string') {
          ElMessage.error(`导入失败，${error}`);
        }
        reject({ pageNum: -1, comment: '', lineIndex: -1 });
      } finally {
        this._importing.value = false;
        message.close();
      }
    });
  }

  private verifyUpload(target: File): boolean {
    if (target?.size > MAXIMUN_SIZE * 1024 * 1024) {
      ElMessage.error(`上传${target?.name ?? ''}失败，文件大小不能超过${MAXIMUN_SIZE}MB！`);
      return false;
    }
    const suffix = target?.name?.substring(target?.name?.lastIndexOf('.'));
    if (!Object.keys(ACCEPT_EXTENSIONS).includes(suffix)) {
      ElMessage.error(
        `上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(ACCEPT_EXTENSIONS).join('/')}格式文件！`,
      );
      return false;
    }

    return true;
  }

  public close() {
    this._visible.value = false;
    this._exceptions.value = [];
  }

  setType(value: string) {
    if (value === this._sizeType.value) {
      return;
    }
    this._sizeType.value = value;
  }

  setFilterFlag(value: boolean) {
    this._filterFlag.value = value;
  }
}
export default new ToolbarService();
