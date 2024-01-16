/**
 * 日历模板类
 */
class CCalendar {
  private _date: Date = new Date(this.id);
  /**
   * @return 日期 年
   */
  public get year(): number {
    return this._date.getFullYear();
  }
  /**
   * @return 日期 月
   */
  public get month(): number {
    return this._date.getMonth() + 1;
  }
  /**
   * @return 日期 日
   */
  public get day(): number {
    return this._date.getDate();
  }
  /**
   * @return 日期 yyyy年M+月d+日
   */
  public get dateString(): string {
    return `${this.year}年${this.month}月${this.day}日`;
  }
  /**
   * @return 时间标记
   */
  public get mark(): EMWorkTimeType {
    return this.checkDateType();
  }

  /**
   * @param id 时间戳
   */
  constructor(public readonly id: number) {}

  private checkDateType(): EMWorkTimeType {
    const today: number = +new Date(new Date().toLocaleDateString());
    const difference: number = ~~((this.id - today) / 86400000);
    switch (true) {
      case difference < 0: {
        return EMWorkTimeType.history;
      }
      case difference === 0: {
        return EMWorkTimeType.today;
      }
      case difference > 0: {
        return EMWorkTimeType.future;
      }
      default:
        return null;
    }
  }
}

export class CTodayWork extends CCalendar {
  constructor(public readonly data: ITodayWorkData) {
    super(+new Date(new Date().toLocaleDateString()));
  }
}

export class CCalendarWork extends CCalendar {
  constructor(id: number, public readonly data: ICalendarWorkData) {
    super(id);
  }
}

export enum EMWorkTimeType {
  history = -1,
  today,
  future,
}

export enum ECalendarTitle {
  日,
  一,
  二,
  三,
  四,
  五,
  六,
}
export enum EMWorkTimeStatus {
  未完成 = 0,
  按时完成,
  延时完成,
}

interface IWorkItem {
  begin?: Date;
  end?: Date;
  description: string;
  status: string;
  statusText: string;
  detailId: number;
  dailyWorkId: number;
  remarks: string;
  attach: string;
  endTime: string;
  workStatus: number;
  beginTime: string;
  finishTime: string;
  attachList: null;
  createdTime?: string;
  measureName: string;
  relatedFunc: string;
  planCode: string;
  timeRange: string;
  executionCycle: string;
  createTime?: string;
  deadline?: string;
}

export interface ITodayWorkData {
  readonly finishedWorks: number;
  readonly totalWorks: number;
  readonly finishedPercentage: number;
  readonly otherWorks: {
    readonly count: number;
    readonly workList: IWorkItem[];
  };
  readonly planWorks: {
    readonly count: number;
    readonly monthlyWorks: IWorkItem[];
    readonly specialWorks: IWorkItem[];
    readonly weeklyWorks: IWorkItem[];
    readonly dailyWorks: IWorkItem[];
  };
}

export interface ICalendarWorkData {
  readonly score: string;
  readonly otherWorks: {
    readonly count: number;
    readonly workList: IWorkItem[];
  };
  readonly planWorks: {
    readonly count: number;
    readonly monthlyWorks: IWorkItem[];
    readonly specialWorks: IWorkItem[];
    readonly weeklyWorks: IWorkItem[];
    readonly dailyWorks: IWorkItem[];
  };
}

export interface ICalendarMonth {
  year: number;
  month: number;
  data: Array<Date[]>;
}
