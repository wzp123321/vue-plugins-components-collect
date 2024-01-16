import message from '@/utils/message';
import { formatDate } from '@/utils/index';
import { ref } from 'vue';
import { BehaviorSubject, Observable } from 'rxjs';

import { postRequest } from '@/service/request';

import { CAR_IQueryForm, CAR_IQueryParams, CAR_EQueryType } from './car-searchbar.api';
import { MA_HOME_DATE_SCOPE, IRes, TOKEN } from '../../management-analysis/ma-home/services/api';

enum EPath {
  查询时间选择范围 = '/businessAnalyse/querySupPeriod',
}

class CarSearchBarService {
  //#region
  private _searchParamsResult$ = new BehaviorSubject<CAR_IQueryParams>({
    year: null,
    valueType: '',
  });

  public get searchParamsResult$() {
    return this._searchParamsResult$ as unknown as Observable<CAR_IQueryParams>;
  }
  //#endregion
  //#region
  public _queryTypeOptions = ref<{ code: number; name: string }[]>([]);

  private _queryParams = ref<CAR_IQueryForm>({
    date: new Date(),
    queryType: null,
  });

  private _dateScope = ref<MA_HOME_DATE_SCOPE>({});

  public get queryTypeOptions(): { code: number; name: string }[] {
    return this._queryTypeOptions.value;
  }

  public get queryParams(): CAR_IQueryForm {
    return this._queryParams.value as CAR_IQueryForm;
  }

  public set queryParams(value: CAR_IQueryForm) {
    this._queryParams.value.date = value?.date ?? null;
    this._queryParams.value.queryType = value?.queryType ?? null;
  }

  public get dateScope(): MA_HOME_DATE_SCOPE {
    return this._dateScope.value as MA_HOME_DATE_SCOPE;
  }
  //#endregion

  constructor() {
    this.init();
  }

  init() {
    this._queryTypeOptions.value = Object.entries(CAR_EQueryType)
      ?.filter(([k, v]) => typeof v === 'number')
      ?.map(([k, v]) => {
        return {
          code: Number(v),
          name: k,
        };
      });
    this._queryParams.value.queryType = CAR_EQueryType.运营期;
    this._queryParams.value.date = new Date();

    this._searchParamsResult$.next({
      ...this.mapQueryParams(),
      clickTrigger: true,
    });

    // this.queryDateScope(this._queryParams.value.queryType).then(() => {
    //   this._searchParamsResult$.next({
    //     ...this.mapQueryParams(),
    //     clickTrigger: true,
    //   });
    // });
  }

  public handleDateReset() {
    this._queryParams.value.date = new Date();
  }

  public async queryDateScope(queryType: number) {
    const convertDate = (data?: MA_HOME_DATE_SCOPE) =>
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
    try {
      const res: IRes<MA_HOME_DATE_SCOPE> = await postRequest(EPath.查询时间选择范围, { queryType, ...TOKEN });
      const data = convertDate(res.data);

      if (!data.startTime && !data.endTime) {
        this._dateScope.value = {
          time: data.time,
          startTime: data.startTime,
          endTime: data.endTime,
        };
        this._queryParams.value.date = null;
        return;
      }
      if (data?.endTime) {
        const y = new Date(data?.endTime).getFullYear();
        if (data.time && new Date(data.time).getFullYear() > y) {
          this._queryParams.value.date = new Date(data?.endTime);
        } else {
          this._queryParams.value.date = data?.time ? new Date(data?.time) : new Date();
        }
      } else {
        this._queryParams.value.date = data?.time && data?.startTime && data?.endTime ? new Date(data?.time) : null;
      }

      this._dateScope.value = data;
    } catch (error) {
      this._dateScope.value = {
        time: new Date().getTime(),
        startTime: new Date().getTime(),
        endTime: new Date().getTime(),
      };
      this._queryParams.value.date = new Date();
      console.warn('查询时间范围', '-->', error);
    }
  }

  search() {
    const params = this.mapQueryParams();
    if (!params?.year) {
      const messageStr = [String(CAR_EQueryType.实验局), String(CAR_EQueryType.建设期)].includes(
        String(this._queryParams.value.queryType),
      )
        ? '暂未有该阶段的成本产生'
        : '请选择日期';
      message.error(messageStr);
    }
    this._searchParamsResult$.next(params);
  }

  reset() {
    this._queryParams.value.queryType = this._queryTypeOptions.value?.[0]?.code ?? null;
    this._queryParams.value.date = new Date();

    this._searchParamsResult$.next(this.mapQueryParams());

    // this.queryDateScope(this._queryParams.value.queryType).then(() => {
    //   this._searchParamsResult$.next(this.mapQueryParams());
    // });
  }

  mapQueryParams() {
    const { queryType, date } = this._queryParams.value;
    return {
      year: date ? Number(formatDate(date, 'yyyy')) : null,
      valueType: String(queryType),
      clickTrigger: true,
    };
  }
}

export default new CarSearchBarService();
