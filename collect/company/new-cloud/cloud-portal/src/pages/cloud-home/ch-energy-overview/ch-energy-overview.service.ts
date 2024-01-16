import { FResHandler, IRes } from '@/core/communication';
import axios from 'axios';
import { CH_EnergyOverviewType, CH_EnergyParamType } from './ch-energy-overview.api';

// 后台接口地址
const enum EPath {
  节费率概览 = '/operationCenter/queryEnergySavingRankList',
}

/**
 * 节费率概览
 * @classdesc 查询节费率概览（最多显示前3名）
 * @default EnergyOverviewService *单例模式
 */

class EnergyOverviewService {
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

  private _energyData: CH_EnergyOverviewType[] = [];
  public get energyDate(): CH_EnergyOverviewType[] {
    return this._energyData;
  }
  constructor() {}

  async queryEnergySavingRankList(param: CH_EnergyParamType): Promise<CH_EnergyOverviewType[]> {
    this._isClick = false;
    this._loading = true;
    this._energyData = [];
    try {
      const convert = (data: EnergyList): Array<CH_EnergyOverviewType> =>
        data?.map((item) => ({
          rankOrder: item.rankOrder,
          tenantName: item.tenantName,
          savingRate: item.savingRate,
          targetRate: item.targetRate,
          differenceRate: item.differenceRate,
          ratioUnit: item.ratioUnit,
        })) ?? [];

      const res: IRes<CH_EnergyOverviewType[]> = await axios.post(EPath.节费率概览, param.queryFlag, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = FResHandler(res);
      this._energyData = convert(data);
      if (this._energyData.length === 0) {
        this._empty = true;
      }
      if (this._energyData.length > 0) {
        this._empty = false;
      }
    } catch (error) {
      this._empty = true;
      console.warn('查询节费率概览（最多显示前3名）', '-->', error);
    } finally {
      this._isClick = true;
      this._loading = false;
    }
    return this._energyData || [];
  }
}

export default new EnergyOverviewService();

type EnergyList = Array<{
  rankOrder: number;
  tenantName: string;
  savingRate: number;
  targetRate: number;
  differenceRate: number;
  ratioUnit: string;
}>;
