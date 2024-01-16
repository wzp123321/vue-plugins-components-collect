import { ref } from 'vue';
import message from '@/utils/message';
import { At_ITableItem, At_ITableItemVO, At_ITableParams } from './adss-table.api';
import { Adss_ISearchForm } from '../adss-search-bar/adss-search-bar.api';
import { Ass_EPath } from '../../ad-share-strategy.api';
import { Common_IHttpListResponsive } from '../../../../../services/common/common-api';
import { FResHandler, formatDate } from '@/utils';
// 请求方法
import { postRequest } from '@/services/request';

export class TableService {
  //#region
  private _dataSource = ref<At_ITableItem[]>([]);
  private _total = ref<number>(0);
  public ruleItem = ref<At_ITableItem | null>(null);
  private _queryParams = ref<At_ITableParams>({
    orders: [
      {
        asc: true,
        column: '',
      },
    ],
    pageNum: 1,
    pageSize: 10,
    searchCount: true,
    likeName: '', // 策略名称
    energyType: '', // 能源类型
    startDate: '',
    endDate: '',
  });

  private _loading = ref<boolean>(true);

  public get dataSource(): At_ITableItem[] {
    return this._dataSource.value;
  }

  public get queryParams(): At_ITableParams {
    return this._queryParams.value;
  }

  public get total(): number {
    return this._total.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }
  //#endregion

  //#region 查询
  async query(params?: Adss_ISearchForm) {
    this._loading.value = true;
    try {
      if (params && params.likeName) {
        this._queryParams.value.likeName = params.likeName;
      }
      if (params && params.energyType) {
        this._queryParams.value.energyType = params.energyType;
      }
      if (params && params.shareDate && params.shareDate.length === 2) {
        this._queryParams.value.startDate =
          params.shareDate.length === 2 ? formatDate(params.shareDate[0], 'yyyy-MM-dd') : '';
        this._queryParams.value.endDate =
          params.shareDate.length === 2 ? formatDate(params.shareDate[1], 'yyyy-MM-dd') : '';
      }

      const res = await postRequest(Ass_EPath.分页查询分摊策略, this._queryParams.value);
      const result = FResHandler<Common_IHttpListResponsive<At_ITableItemVO[]>>(res);
      if (result) {
        this._dataSource.value = result?.list.map((item) => {
          return {
            apportionedName: item.apportionedName ?? '',
            apportionedEndTime: item.apportionedEndTime ?? '',
            id: item.id ?? 0,
            apportionedObject: item.apportionedObject ?? '',
            apportionedObjectList: item.apportionedObjectList ?? '',
            apportionedObjectName: item.apportionedObjectName ?? '',
            apportionedObjectType: item.apportionedObjectType ?? '',
            apportionedRule: item.apportionedRule ?? '',
            apportionedSource: item.apportionedSource ?? '',
            apportionedRuleId: item.apportionedRuleId ?? '',
            apportionedSources: item.apportionedSourceList ?? [],
            apportionedStartTime: item.apportionedStartTime ?? '',
            energyCode: item.energyCode ?? '',
            energyName: item.energyName ?? '',
          };
        });
        this._total.value = res.data?.total;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      this._loading.value = false;
    }
  }

  handlePageChange = (value: number) => {
    this._queryParams.value.pageNum = value;
    this.query();
  };

  handlePageSizeChange = (value: number) => {
    this._queryParams.value.pageNum = 1;
    this._queryParams.value.pageSize = value;
    this.query();
  };

  /**
   * 删除
   * @param id
   */
  async deleteIndicator(id: number) {
    try {
      const res = await postRequest(Ass_EPath.删除分摊策略, id);
      const result = FResHandler<boolean>(res);
      if (result) {
        message.success('删除成功');
        this.query();
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
}
