import { FResHandler, IRes } from '@/core/communication';
import axios from 'axios';
import { Subject } from 'rxjs';
import { CH_ProfitRankDataType, CH_SurplusListType } from './ch-profit-ranking.api';

// 后台接口地址
const enum EPath {
  盈利排行榜 = '/operationCenter/querySurplusRankList',
}

/**
 * 盈利排行榜
 * @classdesc 查询盈利排行榜（最多显示前5名）
 * @default ProfitRankingService *单例模式
 */

class ProfitRankingService {
  private _empty: boolean = false;
  public get empty(): boolean {
    return this._empty;
  }

  private _loading: boolean = false;
  public get loading(): boolean {
    return this._loading;
  }

  private _isClick: boolean = false;
  public get isClick(): boolean {
    return this._isClick;
  }

  constructor() {
    this.queryProfitRankingList('0');
  }

  _getProfitRankingList = new Subject<CH_ProfitRankDataType | undefined>();
  profitRankData = this._getProfitRankingList.asObservable();

  getProfitRankingList(data: CH_ProfitRankDataType | undefined) {
    this._getProfitRankingList.next(data);
  }

  async queryProfitRankingList(param: string): Promise<void> {
    this._isClick = false;
    this._loading = true;
    this._empty = false;
    let rankingList;
    //  this.getProfitRankingList(undefined);
    try {
      const convert = (data: ProfitRankList): CH_ProfitRankDataType | undefined =>
        data
          ? {
              surplusRankList:
                data.surplusRankList?.map((item: CH_SurplusListType) => ({
                  rankOrder: item.rankOrder,
                  surplus: item.surplus,
                  tenantName: item.tenantName,
                })) ?? [],
              unit: data.unit,
            }
          : undefined;

      const res: IRes<CH_ProfitRankDataType> = await axios.post(EPath.盈利排行榜, param, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = FResHandler(res);
      rankingList = convert(data);

      //  this.getProfitRankingList(rankingList);
      // console.log(rankingList);
      if (!rankingList) {
        this._empty = true;
      } else {
        if (rankingList.surplusRankList && rankingList.surplusRankList.length === 0) {
          this._empty = true;
        }
        if (rankingList?.surplusRankList.length > 0) {
          this._empty = false;
        }
      }
    } catch (error) {
      this._empty = true;
      this.getProfitRankingList(rankingList);
      console.warn('查询盈利排行榜（最多显示前5名）', '-->', error);
    } finally {
      this._isClick = true;
      this._loading = false;
    }
    this.getProfitRankingList(rankingList);
  }
}

export default new ProfitRankingService();

type ProfitRankList = {
  surplusRankList: CH_SurplusListType[];
  unit: string;
};
