import { IRes, FResHandler } from '@/core/communication';
import axios from 'axios';
import { TH_PD_IModule } from './th-project-detail.api';

// 后台接口地址
const enum EPath {
  项目详情 = '/project/screen/queryTrusteeshipPeriod',
}

/**
 * 项目详情组件模块服务
 * @classdesc 维护项目详情组件模块数据
 * @exports ProjectDetailService 项目详情组件模块服务（普通类）
 */
export class ProjectDetailService {
  private _data?: TH_PD_IModule;

  // 模块跳转标记
  public get tag(): string | undefined {
    return this._data?.tag;
  }

  //#region 项目详情数据
  // 托管周期
  public get period(): string | undefined {
    return this._data?.period;
  }
  // 能源经理
  public get manager(): string | undefined {
    return this._data?.manager;
  }
  // 托管能源
  public get energy(): string | undefined {
    return this._data?.energy;
  }
  // 项目状态
  public get state(): string | undefined {
    return this._data?.state;
  }
  //#endregion

  /**
   * 查询项目详情组件模块数据
   */
  public async query(): Promise<void> {
    const convert = (data: IResProjectDetail): TH_PD_IModule | undefined =>
      data
        ? {
            tag: data.url,
            period: data.trusteeshipDate,
            manager: data.energyManager,
            energy: data.energyNames,
            state: data.status,
          }
        : undefined;

    try {
      const res: IRes<IResProjectDetail> = await axios.post(EPath.项目详情);
      const data = FResHandler(res);
      this._data = convert(data);
    } catch (error) {
      console.warn('项目详情', '-->', error);
    }
  }
}

interface IResProjectDetail {
  energyManager: string;
  energyNames: string;
  status: string;
  trusteeshipDate: string;
  url: string;
}
