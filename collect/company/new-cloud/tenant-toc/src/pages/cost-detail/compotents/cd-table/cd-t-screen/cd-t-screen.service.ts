import { HTTP_SCommon, HTTP_EState, HTTP_IResult } from 'web-core';
import { ref } from 'vue';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { checkAxiosPermission, postRequest } from '@/service/request';

import { CD_TS_QueryParams, CD_TS_SelectVO, CD_TS_ICodeName } from './cd-t-screen.api';
import { FORBIDDEN_CODES } from '@/config';

// 后台接口地址
const enum EPath {
  查询筛选列表 = 'financialData/query/getSelectList',
  查询成本类型 = '/financialData/query/getCostType',
}

class ScreenService {
  private readonly destroy: any;
  // 筛选
  private _screenSelectMap = ref<Map<string, CD_TS_SelectVO>>(new Map());

  private _costTypeList = ref<CD_TS_ICodeName[]>([]);

  public get screenSelectMap(): Map<string, CD_TS_SelectVO> {
    return this._screenSelectMap.value;
  }

  public set screenSelectMap(value: Map<string, CD_TS_SelectVO>) {
    this._screenSelectMap.value = value;
  }

  public get costTypeList(): CD_TS_ICodeName[] {
    return this._costTypeList.value;
  }

  private _screeHttp: HTTP_SCommon<CD_TS_QueryParams>;

  public get isLoading(): Observable<boolean> {
    return (this._screeHttp.state$ as unknown as Observable<HTTP_EState>).pipe(map((v) => v === HTTP_EState.block));
  }

  public get isEmpty(): Observable<boolean> {
    return (this._screeHttp.result$ as unknown as Observable<HTTP_IResult<CD_TS_QueryParams>>).pipe(
      map((v) => !!v.state && !v.data),
    );
  }

  // 接口响应结果
  public get data() {
    return this._screeHttp.data$ as unknown as Observable<CD_TS_QueryParams>;
  }

  constructor() {
    this.destroy = new Subject<void>();

    this._screeHttp = new HTTP_SCommon({
      url: EPath.查询筛选列表,
      converter: (data) => data as CD_TS_QueryParams,
    });

    /**
     * 订阅result
     */
    this._screeHttp.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
  }

  /**
   * 销毁数据
   */
  public destroyInstance() {
    this._costTypeList.value = [];
    this._screenSelectMap.value = new Map();

    this.destroy.next();
    this.destroy.complete();
  }
  resetData() {
    this._costTypeList.value = [];
    this._screenSelectMap.value.forEach((v, k) => {
      v.isActive = false;
      v.checkList = [];
      v.checked = false;
      v.indeterminate = false;

      this._screenSelectMap.value.set(k, v);
    });
  }
  /**
   * 查询筛选列数据
   * 1.遍历map，判断当前列是否有选中，如果没有则不作为入参
   * @param columnEnName
   */
  public async queryScreen(filterText: string, columnEnName: string, districts: string[]): Promise<void> {
    // 要根据是否有漏斗去判断是否传参
    let params: { [key: string]: string[] | string } = {
      queryColumn: columnEnName,
      districts,
      [columnEnName]: this._screenSelectMap.value?.has(columnEnName)
        ? this._screenSelectMap.value.get(columnEnName)?.checked && !filterText
          ? []
          : (this._screenSelectMap.value.get(columnEnName)?.checkList as string[])
        : [],
    };
    if (this._screenSelectMap.value.size) {
      this._screenSelectMap.value.forEach((v, k) => {
        const list = !v?.isActive ? [] : v?.checkList;
        if (k !== columnEnName) {
          params = {
            ...params,
            [k]: list,
          };
        }
      });
    }
    this._screeHttp.send(JSON.stringify(params));
  }

  /**
   * 查询成本类型列表
   */
  async queryCostTypeList() {
    try {
      const res = await postRequest(EPath.查询成本类型);
      if (res?.code === 200 && res?.data?.length) {
        this._costTypeList.value = res?.data;
      } else {
        this._costTypeList.value = [];
      }
    } catch (error) {
      this._costTypeList.value = [];
    }
  }
  /**
   * 全选按钮
   * @param key 字段key
   * @param checkList 选中数组
   * @param checked 是否选中
   * @param dataSource 数据源
   */
  selectAll(key: string, checkList: string[], checked: boolean, dataSource: string[]) {
    this._screenSelectMap.value.set(key, {
      checked,
      indeterminate: false,
      checkList,
      dataSource,
      isActive: false,
    });
  }
}

export default new ScreenService();
