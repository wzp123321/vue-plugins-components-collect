import axios from 'axios';

import { FResHandler, IRes } from '@/core/communication/index';

import { AlarmSummaryRes, AlarmTrackInfo } from './th-at-api';

import { ref } from 'vue';

const QUERY_URL = '/project/screen/queryAlarmSummary';

const alarmColor = {
  1: {
    color: '#ff0500',
    backgroundColor: '#402732',
  },
  2: {
    color: '#FF9400',
    backgroundColor: '#3F322A',
  },
  3: {
    color: '#ffef00',
    backgroundColor: '#3A3925',
  },
  4: {
    color: '#02a6ff',
    backgroundColor: '#082A40',
  },
};

class AlarmTrackService {
  //#region
  private _loading = ref<boolean>(false);
  private _is_error = ref<boolean>(false);
  private _dataSource = ref<AlarmTrackInfo[]>([]);
  private _url = ref<string>('');
  //#endregion

  //#region
  public get loading(): boolean {
    return this._loading.value;
  }
  public get dataSource(): AlarmTrackInfo[] {
    return this._dataSource.value;
  }
  public get is_error(): boolean {
    return this._is_error.value;
  }
  public get url(): string {
    return this._url.value;
  }
  //#endregion

  // 查询
  query = async () => {
    try {
      this._loading.value = true;
      const res: IRes<AlarmSummaryRes> = await axios.post(QUERY_URL);
      const result = FResHandler<AlarmSummaryRes>(res);
      this._url.value = result?.url ?? '';
      if (result && result.alarmSummaryVOS?.length) {
        this._dataSource.value = result.alarmSummaryVOS.map((item) => {
          return {
            alarmLevel: item.alarmLevel,
            alarmLevelName: item.alarmLevelName,
            handledValue:
              item.handledValue > 9999 ? '9999+' : item.handledValue !== null ? item.handledValue + '' : '0',
            totalValue: item.totalValue > 9999 ? '9999+' : item.totalValue !== null ? item.totalValue + '' : '0',
            color:
              item.alarmLevel && alarmColor[item.alarmLevel] && alarmColor[item.alarmLevel].color
                ? alarmColor[item.alarmLevel].color
                : '',
            backgroundColor:
              item.alarmLevel && alarmColor[item.alarmLevel] && alarmColor[item.alarmLevel].backgroundColor
                ? alarmColor[item.alarmLevel].backgroundColor
                : '',
            precent: item.totalValue > 0 ? Number(((100 * item.handledValue) / item.totalValue).toFixed(0)) : 0,
          };
        });
        this._is_error.value = false;
      } else {
        this._is_error.value = true;
        this._dataSource.value = [];
      }
    } catch (error) {
      this._is_error.value = true;
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  };
}

export default new AlarmTrackService();
