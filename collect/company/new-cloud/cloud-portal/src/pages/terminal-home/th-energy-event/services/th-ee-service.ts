/*
 * @Description: 请求
 * @Autor: zpwan
 * @Date: 2022-04-21 19:53:28
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-28 09:52:14
 */
import { ref } from 'vue';
import axios from 'axios';

import { FResHandler, IRes } from '@/core/communication/index';

import { EnergyEventVO, EnergyEventInfo, IEventRes } from './th-ee-api';

import { VALUE_STATUS } from '../constant/index';

const QUERY_URL = '/project/screen/energyEvent';

class EnergyEventService {
  //#region
  private _dataSource = ref<EnergyEventInfo[]>([]);
  private _costUnit = ref<string>('');
  private _energyUnit = ref<string>('');
  private _total = ref<number>(0);
  private _url = ref<string>('');
  private _loading = ref<boolean>(true);
  private _is_error = ref<boolean>(false);
  //#endregion

  //#region
  public get dataSource(): EnergyEventVO[] {
    return this._dataSource.value;
  }
  public get costUnit(): string {
    return this._costUnit.value;
  }
  public get energyUnit(): string {
    return this._energyUnit.value;
  }
  public get total(): number {
    return this._total.value;
  }
  public get url(): string {
    return this._url.value;
  }
  public get loading(): boolean {
    return this._loading.value;
  }
  public get is_error(): boolean {
    return this._is_error.value;
  }
  //#endregion

  // 请求列表
  query = async () => {
    try {
      this._loading.value = true;
      const res: IRes<IEventRes> = await axios.post(QUERY_URL);
      const result = FResHandler<IEventRes>(res);
      if (result) {
        if (Array.isArray(result?.energyEventList) && result?.energyEventList?.length) {
          this._total.value = result?.energyEventList?.length;
          this._dataSource.value = result?.energyEventList?.length
            ? result?.energyEventList.map((item: EnergyEventVO) => {
                return {
                  index: item.index,
                  eventTitle: item.eventTitle,
                  eventTypeName: item.eventTypeName,
                  energyValue: item.energyValue,
                  energyCost: item.energyCost,
                  entryTime: item.entryTime,
                  status:
                    item.energyCost > 0
                      ? VALUE_STATUS.UP
                      : item.energyCost == 0 || Object.prototype.toString.call(item.energyCost) === '[object Null]'
                      ? VALUE_STATUS.NONE
                      : VALUE_STATUS.DOWN,
                };
              })
            : [];
          this._is_error.value = false;
        } else {
          this._total.value = 0;
          this._dataSource.value = [];
          this._is_error.value = true;
        }
        this._costUnit.value = result?.costUnit ?? '';
        this._energyUnit.value = result?.energyUnit ?? '';
        this._url.value = result?.url ?? '';
      } else {
        this._total.value = 0;
        this._dataSource.value = [];
        this._url.value = '';
        this._is_error.value = true;
      }
    } catch (error) {
      this._total.value = 0;
      this._dataSource.value = [];
      this._url.value = '';
      this._is_error.value = true;
    } finally {
      this._loading.value = false;
    }
  };
}

export default new EnergyEventService();
