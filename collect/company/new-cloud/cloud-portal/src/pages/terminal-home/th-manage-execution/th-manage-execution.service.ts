import { IRes, FResHandler } from '@/core/communication';
import axios from 'axios';
import { TH_ME_IModule } from './th-manage-execution.api';

// 后台接口地址
const enum EPath {
  节能管理 = '/project/screen/energySave',
}

/**
 * 管理节能执行组件模块服务
 * @classdesc 维护管理节能执行组件模块数据
 * @exports ManageExecutionService 管理节能执行组件模块服务（普通类）
 */
export class ManageExecutionService {
  private _data?: TH_ME_IModule;

  // 模块跳转标记
  public get tag(): string | undefined {
    return this._data?.tag;
  }

  //#region 执行得分数据
  // 最低分
  public get min(): number | undefined {
    return this._data?.min;
  }
  // 最高分
  public get max(): number | undefined {
    return this._data?.max;
  }
  /**
   * 获取执行得分
   * @param date 日期（日）
   * @returns 日期对应分数
   */
  public getScore(date: number): number | undefined {
    return this._data?.scores.get(date);
  }
  //#endregion

  /**
   * 查询管理节能执行组件模块数据
   */
  public async query(): Promise<void> {
    const convert = (data: IResEnergyManage): TH_ME_IModule | undefined =>
      data
        ? {
            tag: data.url,
            scores: new Map(Object.entries(data.calendarValue).map(([k, v]) => [+k, v])),
            min: Math.min(...Object.values(data.calendarValue)),
            max: Math.max(...Object.values(data.calendarValue)),
          }
        : undefined;

    try {
      const res: IRes<IResEnergyManage> = await axios.post(EPath.节能管理);
      const data = FResHandler(res);
      this._data = convert(data);
    } catch (error) {
      console.warn('节能管理', '-->', error);
    }
  }
}

interface IResEnergyManage {
  calendarValue: { [key: number]: number };
  url: string;
}
