/*
 * @Author: wanzp
 * @Date: 2023-06-06 11:15:55
 * @LastEditors: wanzp
 * @LastEditTime: 2023-07-03 11:43:59
 * @Description: 边界规则数据服务
 */
import { ref } from 'vue';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { getTenant } from '@/utils';

import { postRequest } from '@/service/request';

import { BM_IAddManagementForm, BmSbIHostPeriodVO } from './bm-search-bar/bm-search-bar.api';
import { BM_IQueryByConditionResponse, BM_IQueryByConditionTypeVO, EBmPath } from './boundary-management.api';
import { CommonIHttpRes } from '@/service/api';
import { BM_IBoundaryTypeDataVO, BM_HEADER_NAME } from './bm-collapse-home/bm-collapse-home.api';

class BoundaryManagementDataService {
  //#region
  private _bmQueryParams = new Subject<BM_IAddManagementForm>();

  private _bmBoundaryEventResult = new Subject<BM_IBoundaryTypeDataVO[]>();

  private _bmSearchLoading = new BehaviorSubject<boolean>(true);

  public get bmQueryParams(): Observable<BM_IAddManagementForm> {
    return this._bmQueryParams as unknown as Observable<BM_IAddManagementForm>;
  }

  public get bmBoundaryEventResult(): Observable<BM_IBoundaryTypeDataVO[]> {
    return this._bmBoundaryEventResult as unknown as Observable<BM_IBoundaryTypeDataVO[]>;
  }

  public get bmSearchLoading(): Observable<boolean> {
    return this._bmSearchLoading as unknown as Observable<boolean>;
  }
  //#endregion
  //#region
  // 托管期
  private _hostPeriodList = ref<BmSbIHostPeriodVO[]>([]);
  // 查询数据
  private searchForm: BM_IAddManagementForm = {
    hostingPeriod: null,
    measureType: '',
    verificationType: '',
    startTime: '',
    endTime: '',
  };
  public get hostPeriodList(): BmSbIHostPeriodVO[] {
    return this._hostPeriodList.value;
  }
  public set hostPeriodList(value: BmSbIHostPeriodVO[]) {
    this._hostPeriodList.value = value;
  }
  //#endregion
  async query(form: BM_IAddManagementForm = this.searchForm) {
    this.searchForm = {
      ...this.searchForm,
      ...form,
    };
    try {
      const params = {
        ...this.searchForm,
        ...getTenant(),
      };
      this._bmQueryParams.next(form);
      this._bmSearchLoading.next(true);
      const res: CommonIHttpRes<BM_IQueryByConditionResponse> = await postRequest(
        EBmPath['页面查询-除边界规则之外的数据'],
        params,
      );
      if (res?.success) {
        this._bmBoundaryEventResult.next(this.convertEventTable(res?.data));
      } else {
        this._bmBoundaryEventResult.next([]);
      }
    } catch (error) {
      console.log('%c✨✨查询✨✨', 'font-size: 24px', error);
      this._bmBoundaryEventResult.next([]);
    } finally {
      this._bmSearchLoading.next(false);
    }
  }
  /**
   * 处理数据
   * @param data
   * @returns
   */
  private convertEventTable(data: BM_IQueryByConditionResponse): BM_IBoundaryTypeDataVO[] {
    const list: BM_IBoundaryTypeDataVO[] = [];

    if (!data || Object.keys(data)?.length === 0) {
      return list;
    }
    Object.entries(data)?.forEach(([k, v]) => {
      if (v) {
        Object.entries(v).forEach(([ck, cv]) => {
          const { boundaryTypeName, persistentType, tableVO } = cv as BM_IQueryByConditionTypeVO;
          list.push({
            boundaryTypeId: Number(ck),
            boundaryTypeName,
            persistentType,
            activeEventIndex: 0,
            tableData: tableVO?.map((tItem) => {
              return {
                chainId: tItem?.chainId ?? null,
                eventId: tItem?.eventId ?? null,
                eventName: tItem?.eventName ?? '',
                headerColSpan: tItem?.titleList?.filter((i) => i === BM_HEADER_NAME)?.length ?? 1,
                editableMonths: tItem?.editableMonths ?? [],
                deviceType: tItem?.deviceType ?? '',
                titleList: tItem?.titleList ?? [],
                dataList:
                  tItem?.dataList?.map((dItem) => {
                    // 默认数据
                    const defaultList = tItem?.titleList
                      ?.filter((titleItem) => titleItem !== '能源类型')
                      ?.map((item) => null);
                    return {
                      energyCode: dItem?.energyCode ?? '',
                      energyName: dItem?.energyName ?? '',
                      energyUnit: dItem?.energyUnit ?? '',
                      hostingAreaId: dItem?.hostingAreaId ?? null,
                      hostingAreaName: dItem?.hostingAreaName ?? '',
                      itemName: dItem?.itemName ?? '',
                      dataList: dItem?.dataList ?? defaultList,
                      editFlag: dItem?.editFlag ?? false,
                      lineTotal: dItem?.lineTotal ?? null,
                      summaryFlag: dItem?.summaryFlag ?? false,
                      commentFlag: dItem?.commentFlag ?? false,
                      comment: dItem?.comment ?? '',
                    };
                  }) ?? [],
              };
            }),
          });
        });
      }
    });
    return list;
  }
}
export default new BoundaryManagementDataService();
