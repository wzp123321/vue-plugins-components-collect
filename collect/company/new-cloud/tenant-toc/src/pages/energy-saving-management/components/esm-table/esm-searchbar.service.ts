import { ref } from 'vue';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { postRequest } from '@/service/request';
import { formatDate, getTenant } from '@/utils';
import { BmSbITimeVO } from '@/pages/boundary-management/bm-search-bar/bm-search-bar.api';

export interface Esm_IHostPeriodVO {
  index: number;
  name: string;
  status: boolean;
  start: BmSbITimeVO;
  end: BmSbITimeVO;
}
// 查询参数
export interface Esm_IQueryParamsVO {
  index: number | null;
  startTime: string;
  endTime: string;
}

enum EPath {
  获取托管周期 = 'baseHead/queryHostingPeriods',
}
class EsmSearchbarService {
  private _searchParams$ = new Subject<Esm_IQueryParamsVO>();
  public get searchParams$() {
    return this._searchParams$ as unknown as Observable<Esm_IQueryParamsVO>;
  }

  private _periodList$ = new BehaviorSubject<Esm_IHostPeriodVO[]>([]);
  public get periodList$() {
    return this._periodList$ as unknown as Observable<Esm_IHostPeriodVO[]>;
  }

 
  constructor() {
    this.queryPeriodList();
  }

  // 托管周期列表
  private _periodList = ref<Esm_IHostPeriodVO[]>([]);
  public get periodList(): Esm_IHostPeriodVO[] {
    return this._periodList.value;
  }

  // 查询表格参数
  private _queryParamsRef = ref<number | null>(null);
  public startTime = ref<string>('');
  public endTime = ref<string>('');
  public get queryParamsRef() {
    return this._queryParamsRef.value;
  }
  public set queryParamsRef(value: any) {
    this._queryParamsRef.value = value;
  }

  //默认选中的托管期
  private _code = ref<number | null>();
  public get code() {
    return this._code.value;
  }
  public set code(val) {
    this._code.value = val;
  }

  // 查询
  public search = () => {
    this._searchParams$.next(this.mapQueryParams());
  };


  private mapQueryParams = (): Esm_IQueryParamsVO => {
    let startTime = '';
    let endTime = '';

    this._periodList.value.forEach((item) => {
      if (item.index === this._queryParamsRef.value) {
        const startDate = new Date();
        startDate.setFullYear(item.start.year);
        startDate.setMonth(item.start.monthOfYear - 1);
        startTime = formatDate(startDate, 'yyyy-MM');
        const endDate = new Date();
        endDate.setFullYear(item.end.year);
        endDate.setMonth(item.end.monthOfYear - 1);
        endTime = formatDate(endDate, 'yyyy-MM');
      }
    });
    this.startTime.value = startTime;
    this.endTime.value = endTime;

    return {
      index: this._queryParamsRef.value,
      startTime,
      endTime,
    };
  };

  // 查询托管周期
  private queryPeriodList = async (): Promise<void> => {
    try {
      const res = await postRequest(EPath.获取托管周期, getTenant());
      if (res?.data.length && res.code === 200) {
        this._periodList.value = res.data?.map((item: any) => {
          return {
            index: item.code,
            name: item.name,
            start: item.start,
            end: item.end,
            status: item.status,
          };
        });
        this._periodList.value.forEach((item: any) => {
          if (item.status === true) {
            this._queryParamsRef.value = item.index;
          }
        });
        // this._searchParams$.next(this.mapQueryParams());
      } else {
        this._periodList.value = [];
        this._queryParamsRef.value = null;
      }
      this._periodList$.next(this._periodList.value);
    } catch (error) {
      this._periodList.value = [];
      console.log(error);
    } finally {
      this._searchParams$.next(this.mapQueryParams());
    }
  };
}

export default new EsmSearchbarService();
