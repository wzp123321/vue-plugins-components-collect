import { ref } from 'vue';
import {
  EPath,
  QM_EAreaType,
  QM_EDateType,
  QM_ELevelType,
  type QM_IDataListItem,
  type QM_ISearchParams,
} from './quota-management.api';
import { commonHttp } from '@/api/request';
import type { Common_IHttpListResponseImpl, Common_IHttpResponseImpl } from '@/api/model';
import { floatMultiply } from '@/utils';
import { usePageErrorController } from '@/hook/usePageErrorController';
/**
 * 异常状态
 */
const { mapPageLoadError, handleErrorCode } = usePageErrorController();
class QuotaManagementService {
  public get loadError() {
    return mapPageLoadError();
  }

  private _dataList = ref<QM_IDataListItem[]>([]);
  public get dataList() {
    return this._dataList.value;
  }

  private _searchParams = ref<QM_ISearchParams>({
    quotaType: QM_EDateType.本月,
    treeType: QM_EAreaType.区域,
    treeLevel: QM_ELevelType.一级,
    pageNum: 1,
    pageSize: 10,
    searchCount: true,
    orders: [
      {
        column: '',
        asc: true,
      },
    ],
  });
  public get searchParams() {
    return this._searchParams.value;
  }
  public set searchParams(val) {
    this._searchParams.value = val;
  }

  private _pageInfo = ref<{
    pageNum: number;
    pageSize: number;
    total: number;
    pages: number;
  }>({
    pageNum: 1,
    pages: 0,
    pageSize: 10,
    total: 0,
  });
  public get pageInfo() {
    return this._pageInfo.value;
  }

  private _is_error = ref(false);
  public get is_error() {
    return this._is_error.value;
  }

  private _isLoading = ref(true);
  public get isLoading() {
    return this._isLoading.value;
  }

  private convert = (data: QM_IDataListItem[], isPage = false) => {
    console.log('%c🚀 ~ quota-management.service.ts ~ 56行', 'font-size: 18px', this._dataList.value);
    this._dataList.value = [
      ...(isPage ? this._dataList.value : []),
      ...data.map((item) => {
        return {
          treeId: item.treeId,
          treeName: item.treeName,
          energyInfoList: item.energyInfoList.map((it) => {
            return {
              energyName: it.energyName,
              energyCode: it.energyCode,
              percentValue: floatMultiply(it.percentValue, 100),
              waringCode: it.waringCode,
              quotaValue: it.quotaValue,
              energyValue: it.energyValue,
            };
          }),
        };
      }),
    ];
  };
  //数据
  public getDataList = async (isPage = false) => {
    try {
      this._isLoading.value = true;
      const res: Common_IHttpResponseImpl<Common_IHttpListResponseImpl<QM_IDataListItem[]>> = await commonHttp.post(
        EPath.获取KPI列表,
        this._searchParams.value,
      );
      if (res.code === 200 && res.success && res.data) {
        this.convert(res.data.list, isPage);
        this._pageInfo.value.pageNum = res.data.pageNum;
        this._pageInfo.value.pageSize = res.data.pageSize;
        this._pageInfo.value.pages = res.data.pages;
        this._pageInfo.value.total = res.data.total;
        this._is_error.value = false;
        this._isLoading.value = false;
      } else {
        this._is_error.value = true;
        this._isLoading.value = false;
        this._dataList.value = [];
      }
    } catch (error) {
      handleErrorCode((error as any).errcode);
      this._isLoading.value = false;
      this._dataList.value = [];
      this._is_error.value = true;
    }
  };

  constructor() {}
}

export default new QuotaManagementService();
