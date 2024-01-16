import { FResHandler, IRes } from '@/core/communication';
import { TH_ERiskRank, TH_IBaseInfo } from '../terminal-home.api';
import axios from 'axios';

import title from '../../../assets/img/terminal-home/th-title.png';

// 后台接口地址
const enum EPath {
  项目名称标签 = '/project/screen/queryHomePage',
}

/**
 * 基本信息服务
 * @classdesc 维护当前端侧项目基本信息（页面头部信息）
 * @default InfoService 基本信息服务（单例模式）
 */
class InfoService {
  private _data?: TH_IBaseInfo;

  // 服务器时间
  public get time(): Date {
    return this._data?.time ?? new Date();
  }

  // 端侧项目标题
  public get title(): string | undefined {
    return this._data?.title ?? title;
  }

  public get name(): string {
    return this._data?.name ?? '天溯运营中心';
  }

  //#region 端侧项目类型数据
  // 托管类型
  public get hostingType(): string | undefined {
    return this._data?.hostingType;
  }
  // 风险类型
  public get riskType(): string | undefined {
    return this._data?.riskType;
  }
  // 基准类型
  public get benchmarkType(): string | undefined {
    return this._data?.benchmarkType;
  }
  // 收益类型
  public get profitType(): string | undefined {
    return this._data?.profitType;
  }
  // 收益分享详细内容
  public get profitDetails(): readonly string[] {
    return [...(this._data?.profitDetails ?? [])];
  }
  //#endregion

  /**
   * 获取端侧项目基本信息
   */
  public async query(): Promise<void> {
    const convert = (data: IResProjectInfo): TH_IBaseInfo | undefined =>
      data
        ? {
            time: data.time ? new Date(data.time) : new Date(),
            name: data.hospitalName,
            title: data.hospitalUrl,
            hostingType: data.hostingTypeName,
            riskType: data.riskRatingName,
            benchmarkType: data.benchmarkType,
            profitType: data.profit,
            profitDetails: data.profitDetail ?? [],
          }
        : undefined;

    try {
      const res: IRes<IResProjectInfo> = await axios.post(EPath.项目名称标签);
      const data = FResHandler(res);
      this._data = convert(data);

      if (this._data?.name) {
        document.title = this._data.name;
      }
    } catch (error) {
      console.warn('项目名称标签', '-->', error);
    }
  }
}
export default new InfoService();

interface IResProjectInfo {
  benchmarkType: string;
  hospitalName: string;
  hospitalUrl: string;
  hostingTypeName: string;
  profit: string;
  profitDetail: string[];
  riskRatingName: TH_ERiskRank;
  time: number;
}
