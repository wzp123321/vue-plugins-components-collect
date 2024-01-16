/*
 * @Description:
 * @Autor: zpwan
 * @Date: 2022-04-21 17:16:10
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2022-05-09 09:27:47
 */
import { ref } from 'vue';
import axios from 'axios';
import { EnergySurveyInfo, EnergySurveyRes, EnergySurveyVO } from './th-energy-survey.api';

import { FResHandler, IRes } from '@/core/communication/index';

import { VALUE_STATUS } from '../../th-energy-event/constant/index';

const QUERY_URL = '/project/screen/energyOverview';

const ENEGY_ICON = {
  '01000': 'icon-dian',
  '02000': 'icon-shui',
  '03000': 'icon-ranqi',
  '20000': 'icon-zhengqi',
};

const ENETGY_COLOR = {
  '01000': 'rgba(54, 129, 255, 100)',
  '02000': 'rgba(0, 178, 97, 100)',
  '03000': 'rgba(255, 203, 32, 100)',
  '20000': 'rgba(254, 75, 78, 100)',
};

class EnergySurveyService {
  //#region
  private _dataSource = ref<EnergySurveyInfo[]>([]);
  private _loading = ref<boolean>(true);
  private _is_error = ref<boolean>(false);
  private _url = ref<string>('');
  //#endregion

  //#region
  public get dataSource(): EnergySurveyInfo[] {
    return this._dataSource.value;
  }
  public get loading(): boolean {
    return this._loading.value;
  }
  public get is_error(): boolean {
    return this._is_error.value;
  }
  public get url(): string {
    return this._url.value;
  }
  //#endregion

  query = async () => {
    try {
      this._loading.value = true;
      this._is_error.value = false;
      const res: IRes<EnergySurveyRes> = await axios.post(QUERY_URL);

      const result = FResHandler<EnergySurveyRes>(res);
      this._url.value = result?.url ?? '';
      if (result && result.energyOverviewVOS?.length) {
        this._dataSource.value = result.energyOverviewVOS.map((item: EnergySurveyVO) => {
          return {
            energyCode: item.energyCode ?? '--',
            energyName: item.energyName ?? '--',
            sum: item.sum ?? '--',
            lastMonthRatio: item.lastMonthRatio === '--' ? '--' : Math.abs(Number(item.lastMonthRatio)) + '',
            lastYearRatio: item.lastYearRatio === '--' ? '--' : Math.abs(Number(item.lastYearRatio)) + '',
            unit: item.unit ?? '--',
            lastMonthStatus:
              item.lastMonthRatio === '--' ||
              item.lastMonthRatio == '0' ||
              Object.prototype.toString.call(item.lastMonthRatio) === '[object Null]'
                ? VALUE_STATUS.NONE
                : Number(item.lastMonthRatio) > 0
                ? VALUE_STATUS.UP
                : VALUE_STATUS.DOWN,
            lastYearStatus:
              item.lastYearRatio === '--' ||
              item.lastYearRatio == '0' ||
              Object.prototype.toString.call(item.lastYearRatio) === '[object Null]'
                ? VALUE_STATUS.NONE
                : Number(item.lastYearRatio) > 0
                ? VALUE_STATUS.UP
                : VALUE_STATUS.DOWN,
            color: ENETGY_COLOR[item.energyCode] ? ENETGY_COLOR[item.energyCode] : ENETGY_COLOR['01000'],
            icon: ENEGY_ICON[item.energyCode] ? ENEGY_ICON[item.energyCode] : ENEGY_ICON['01000'],
          };
        });
        this._is_error.value = false;
      } else {
        this._is_error.value = true;
        this._dataSource.value = [];
        this._is_error.value = true;
      }
    } catch (error) {
      this._is_error.value = true;
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  };
}

export default new EnergySurveyService();
