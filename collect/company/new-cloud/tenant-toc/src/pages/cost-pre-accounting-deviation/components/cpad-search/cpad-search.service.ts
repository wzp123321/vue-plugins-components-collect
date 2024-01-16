/*
 * @Author: yut
 * @Date: 2023-09-13 16:57:12
 * @LastEditors: yut
 * @LastEditTime: 2023-11-13 14:29:47
 * @Descripttion:
 */
import { ref } from 'vue';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { getTenant } from '@/utils';
import { CPAD_EDateType, CPAD_IDateScope, CPAD_QueryParams, EPath } from './cpad-search.api';
import { IRes } from '@/core/file';
import { postRequest } from '@/service/request';

class CpAdSearchBarService {
  //时间类型
  private _durationType = ref(CPAD_EDateType.按月);
  public get durationType() {
    return this._durationType.value;
  }
  public set durationType(val) {
    this._durationType.value = val;
  }

  private _date = ref<Date[]>([]);
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  private _searchParamsRef$ = new Subject<CPAD_QueryParams>();

  constructor() {}

  public get searchParamsRef$() {
    return this._searchParamsRef$ as unknown as Observable<CPAD_QueryParams>;
  }

  private _searchFormRef = ref<string>('');

  public get searchFormRef(): string {
    return this._searchFormRef.value;
  }

  public set searchFormRef(val: string) {
    this._searchFormRef.value = val;
  }

  // 查询
  public search = (sDate?: string, eDate?: string) => {
    this._searchParamsRef$.next(this.mapQueryParams(sDate, eDate));
  };

  public queryDateScope(): Promise<CPAD_IDateScope> {
    const convertDate = (data?: CPAD_IDateScope) =>
      data
        ? {
            time: data?.time ?? 0,
            endTime: data?.endTime ?? 0,
            startTime: data?.startTime ?? 0,
          }
        : {
            time: 0,
            endTime: 0,
            startTime: 0,
          };
    return new Promise(async (resolve) => {
      try {
        const res: IRes<CPAD_IDateScope> = await postRequest(EPath.查询时间选择范围, { ...getTenant() });
        const data = convertDate(res.data);
        resolve(data);
      } catch (error) {
        resolve({
          time: new Date().getTime(),
          startTime: new Date().getTime(),
          endTime: new Date().getTime(),
        });
        console.warn('查询时间范围', '-->', error);
      }
    });
  }

  private mapQueryParams(sDate?: string, eDate?: string) {
    return this._durationType.value === CPAD_EDateType.累计
      ? {
          type: this._durationType.value,
          ...getTenant(),
        }
      : {
          type: this._durationType.value,
          endTime: eDate ?? '',
          startTime: sDate ?? '',
          ...getTenant(),
        };
  }
}

export default new CpAdSearchBarService();
