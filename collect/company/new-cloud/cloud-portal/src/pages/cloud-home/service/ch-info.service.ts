import { FResHandler, IRes } from '@/core/communication';
import axios from 'axios';
import { CH_EWeather, CH_IBaseInfo } from '../cloud-home.api';

// 后台接口地址
const enum EPath {
  天气获取 = '/weather/queryWeather',
}

/**
 * 基本信息服务
 * @classdesc 维护当前云侧天气、日期等基本信息（页面头部信息）
 * @default InfoService *单例模式
 */
class InfoService {
  private _data?: CH_IBaseInfo;

  // 服务器所在地天气
  public get weather(): CH_EWeather | undefined {
    return this._data?.weather;
  }
  // 服务器时间
  public get time(): Date {
    return this._data?.time ?? new Date();
  }

  public async query(): Promise<void> {
    const convert = (data: IResWeather): CH_IBaseInfo | undefined =>
      data
        ? {
            time: data.timestamp ? new Date(data.timestamp) : new Date(),
            weather: data.code,
          }
        : undefined;

    try {
      const res: IRes<IResWeather> = await axios.post(EPath.天气获取);
      const data = FResHandler(res);
      this._data = convert(data);
    } catch (error) {
      console.warn('项目名称标签', '-->', error);
    }
  }
}
export default new InfoService();

interface IResWeather {
  code: CH_EWeather;
  timestamp: number;
}
