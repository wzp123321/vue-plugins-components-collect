import { Injectable } from '@angular/core';
import { AppService } from '@src/app/app.service';
import { EnergyManagerService } from '../energy-manager.service';
import { CCalendarWork, CTodayWork } from './ems-calendar.api';

@Injectable()
export class EmsCalendarService {
  private _today: CTodayWork = null;
  public get today(): CTodayWork {
    return this._today;
  }

  private _day: CCalendarWork = null;
  public get day(): CCalendarWork {
    return this._day;
  }

  private _alarm: number = null;
  public get alarm(): number {
    return this._alarm;
  }

  isAgency: Boolean = false;

  constructor(private sEnergyManager: EnergyManagerService, private sApp: AppService) {
    this.sEnergyManager.getAlarmCount().then((v) => {
      this._alarm = v;
    });

    if (this.sApp.config) {
      if (this.sApp.config.moduleinfo) {
        // todo根据值触发对应的header处理方法
        let moduleInfo = this.sApp.config.moduleinfo;
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          this.isAgency = true;
        }
      }
    }
  }

  public async setToday(): Promise<boolean> {
    let param: any = {};
    if (this.isAgency) {
      param.isUndo = true;
    } else {
      param.isUndo = false;
    }
    try {
      const data = await this.sEnergyManager.getTodayWork(param);
      // 排序工作日、日
      data?.planWorks?.dailyWorks?.map((item) => {
        item.begin = item.beginTime ? new Date(`${new Date().toLocaleDateString()} ${item.beginTime}:00`) : null;
        item.end = item.endTime ? new Date(`${new Date().toLocaleDateString()} ${item.endTime}:00`) : null;
      });
      data?.planWorks?.dailyWorks.sort((a, b) => {
        if (a.begin === b.begin) {
          return +a.end - +b.end;
        }
        return +a.begin - +b.begin;
      });
      //  console.log(data.planWorks.dailyWorks);
      this._today = new CTodayWork(data);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async setDate(date: Date): Promise<boolean> {
    date = new Date(date.toLocaleDateString());
    try {
      const data = await this.sEnergyManager.getCalendarWork(this.getDateString(date));
      // 排序工作日、日
      data?.planWorks?.dailyWorks?.map((item) => {
        item.begin = item.beginTime ? new Date(`${new Date(date).toLocaleDateString()} ${item.beginTime}:00`) : null;
        item.end = item.endTime ? new Date(`${new Date(date).toLocaleDateString()} ${item.endTime}:00`) : null;
      });
      data?.planWorks?.dailyWorks.sort((a, b) => {
        if (a.begin === b.begin) {
          return +a.end - +b.end;
        }
        return +a.begin - +b.begin;
      });

      this._day = new CCalendarWork(+date, data);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * 获取符合接口标准的格式化日期
   * @param date
   * @returns 日期 yyyy-MM-dd
   */
  private getDateString(date: Date): string {
    const year: string = date.getFullYear().toString();
    const month: string = (date.getMonth() + 1).toString();
    const day: string = date.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
