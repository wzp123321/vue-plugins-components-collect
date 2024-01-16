import { Subject, Observable } from 'rxjs';
import { postRequest } from '@/services/request';

import { Common_IHttpResponse } from '@/services/common/common-api';
import {
  DRP_IAssessRankResultVO,
  DRP_ConvertAssessResultVO,
  DRP_IConvertDetailTableVO,
  DRP_IDetailTableVO,
  DRP_IQueryParams,
  DRP_ESortType,
  DRP_LABEL_MAX_WIDTH,
} from './da-result-publicity.api';
import { DA_EPath } from '../department-assessment.api';
import { DSB_IPageForm } from './dsp-search-bar/dsp-search-bar.api';
import { formatDate, thousandSeparation } from '@/utils';

class DaResultPublicityService {
  // rank-loading
  private _rankLoading$ = new Subject<boolean>();
  // 考核排行结果
  private _assessRankResult$ = new Subject<DRP_ConvertAssessResultVO>();
  // detail-loading
  private _detailLoading$ = new Subject<boolean>();
  // 考核明细结果
  private _assessDetailResult$ = new Subject<DRP_IConvertDetailTableVO>();
  // 查询参数
  private _queryParams$ = new Subject<DRP_IQueryParams>();
  // 是否重置排序
  private _resetSortSignal$ = new Subject<boolean>();
  // rank-loading
  public get rankLoading() {
    return this._rankLoading$ as unknown as Observable<boolean>;
  }
  // 考核排行结果
  public get assessRankResult() {
    return this._assessRankResult$ as unknown as Observable<DRP_ConvertAssessResultVO>;
  }
  // detail-loading
  public get detailLoading() {
    return this._detailLoading$ as unknown as Observable<boolean>;
  }
  // 考核明细结果
  public get assessDetailResult() {
    return this._assessDetailResult$ as unknown as Observable<DRP_IConvertDetailTableVO>;
  }
  // 查询参数
  public get queryParams() {
    return this._queryParams$ as unknown as Observable<DRP_IQueryParams>;
  }
  // 是否重置排序
  public get resetSortSignal() {
    return this._resetSortSignal$ as unknown as Observable<boolean>;
  }
  /**
   * 查询考核结果
   * @param {DSB_IPageForm} form 查询表单
   * @param {string} rankOrder 排名排序方式，默认降序
   * @param {string} ratioOrder 盈余率排序方式，默认降序
   */
  public query(form: DSB_IPageForm, rankOrder: string = DRP_ESortType.降序, ratioOrder: string = DRP_ESortType.降序) {
    this.queryRankList(form, rankOrder, ratioOrder);
    this.queryDetailList(form);
    // 子组件表格需要重置排序
    this._resetSortSignal$.next(true);
  }
  /**
   * 重置loading
   */
  public resetLoading() {
    this._detailLoading$.next(false);
    this._rankLoading$.next(false);
  }
  /**
   * 生成请求参数
   * @param {DSB_IPageForm} params
   * @returns {DRP_IQueryParams}
   */
  private mapQueryParams(params: DSB_IPageForm): DRP_IQueryParams {
    const { energyCode, date, indexId } = params;
    return {
      energyCode,
      queryTime: date ? formatDate(date, 'yyyy-MM') : '',
      indexId,
    };
  }
  /**
   * 查询科室考核排行榜数据
   * @param {DSB_IPageForm} params
   * @param {string} rankOrder
   * @param {string} ratioOrder
   */
  public async queryRankList(params: DSB_IPageForm, rankOrder: string, ratioOrder: string) {
    const convertParams: DRP_IQueryParams = {
      ...this.mapQueryParams(params),
      rankOrder,
      ratioOrder,
    };
    try {
      this._rankLoading$.next(true);
      const res: Common_IHttpResponse<DRP_IAssessRankResultVO> = await postRequest(
        DA_EPath.查询科室考核排行榜,
        convertParams,
      );
      if (res?.success) {
        this._assessRankResult$.next(this.convertRankList(res?.data));
      } else {
        this._assessRankResult$.next(this.convertRankList());
      }
    } catch (error) {
      this._assessRankResult$.next(this.convertRankList());
    } finally {
      this._rankLoading$.next(false);
    }
  }
  /**
   * 处理考核排行榜数据
   * @param {DRP_IAssessRankResultVO} data 接口响应数据
   * @returns {DRP_ConvertAssessResultVO}
   */
  private convertRankList(data?: DRP_IAssessRankResultVO): DRP_ConvertAssessResultVO {
    const rankList = data?.surplusRankList?.map((item) => item?.surplusValue) ?? [];
    const ratioList = data?.surplusRatioList?.map((item) => item?.ratioValue) ?? [];
    // 值以及百分比的最大最小值
    const max_value = Math.max(...rankList);
    const min_value = Math.min(...rankList);
    const max_ratio = Math.max(...ratioList);
    const min_ratio = Math.min(...ratioList);
    return {
      savingTotalValue: data?.savingTotalValue ?? null,
      unit: data?.unit ?? '',
      surplusRankUnit: data?.surplusRankUnit ?? '',
      surplusRankList:
        data?.surplusRankList?.map((item) => ({
          name: item?.name ?? '',
          value: thousandSeparation(item?.surplusValue) ?? '',
          negativeFlag: item?.negativeFlag ?? '',
          width: item?.negativeFlag
            ? this.mapProgressWidth(item?.surplusValue, min_value)
            : this.mapProgressWidth(item?.surplusValue, max_value),
        })) ?? [],
      surplusRatioList:
        data?.surplusRatioList?.map((item) => ({
          name: item?.name ?? '',
          value: item?.ratioValue !== null ? item?.ratioValue + '' : '',
          negativeFlag: item?.negativeFlag ?? '',
          width: item?.negativeFlag
            ? this.mapProgressWidth(item?.ratioValue, min_ratio)
            : this.mapProgressWidth(item?.ratioValue, max_ratio),
        })) ?? [],
    };
  }
  /**
   * 生成对应宽度
   * @param {number} current 当前的值
   * @param {number} denominator 分母
   * @returns {string}
   */
  private mapProgressWidth = (current: number, denominator: number | undefined): string => {
    const p = denominator !== 0 && denominator !== undefined ? (Math.abs(current) / Math.abs(denominator)) * 100 : 0;
    return p !== 0 ? `calc(${p}% - ${(p * DRP_LABEL_MAX_WIDTH) / 100}px)` : '100%';
  };
  /**
   * 查询考核明细数据
   * @param {DSB_IPageForm} params
   */
  public async queryDetailList(params: DSB_IPageForm) {
    const convertParams: DRP_IQueryParams = this.mapQueryParams(params);
    this._queryParams$.next(convertParams);
    try {
      this._detailLoading$.next(true);
      const res: Common_IHttpResponse<DRP_IDetailTableVO> = await postRequest(DA_EPath.查询科室考核明细, convertParams);
      if (res?.success) {
        this._assessDetailResult$.next(this.convertDetailList(res?.data));
      } else {
        this._assessDetailResult$.next(this.convertDetailList(res?.data));
      }
    } catch (error) {
      this._assessDetailResult$.next(this.convertDetailList());
    } finally {
      this._detailLoading$.next(false);
    }
  }
  /**
   * 处理考核明细数据
   * @param {DRP_IDetailTableVO} data 接口响应结果
   * @returns {DRP_IConvertDetailTableVO}
   */
  private convertDetailList(data?: DRP_IDetailTableVO): DRP_IConvertDetailTableVO {
    return {
      headList: data?.headList ?? [],
      bodyList:
        data?.bodyList?.map((item, index) => {
          let obj = {};
          const redColumns: string[] = [];
          data?.headList?.forEach((hItem, hIndex) => {
            obj = {
              ...obj,
              [hItem]: item?.[hIndex]?.value,
              ['序号']: `${index + 1}`,
            };
            if (item?.[hIndex]?.redFlag) {
              redColumns.push(hItem);
            }
          });
          return {
            ...obj,
            redColumns,
          };
        }) ?? [],
    };
  }
}

export default new DaResultPublicityService();
