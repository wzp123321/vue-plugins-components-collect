import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import {
  ACC_IStrategyItem,
  ACC_IStrategyProcessItem,
} from '../air-conditioner-control.api';
import { AirConditionerControlCommunicationService } from '../service/air-conditioner-control-communication.service';
import { AirConditionerControlDatabaseService } from '../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlListService {
  // 空调运行优化侧率 loading

  public get loading(): boolean {
    return this.accDatabaseService.refTodayStrategy$.isLoading;
  }
  // 空调运行优化侧率 empty
  public get empty(): boolean {
    return (
      this.accDatabaseService.refTodayStrategy$.isEmpty || !this.list.length
    );
  }
  // 空调运行优化侧率 date
  public get date(): Date {
    return this.accDatabaseService.refTodayStrategy$.value?.date ?? null;
  }

  // 空调运行优化侧率 list列表
  public get list(): ACC_IStrategyItem[] {
    return this.accDatabaseService.refTodayStrategy$.value?.list ?? [];
  }

  // 空调运行策略进度 strategyLoading
  public get strategyLoading(): boolean {
    return this.accDatabaseService.refStrategyProcess$.isLoading;
  }

  // 空调运行策略进度 strategyEmpty
  public get strategyEmpty(): boolean {
    return (
      this.accDatabaseService.refStrategyProcess$.isEmpty ||
      !this.strategyList.details.length
    );
  }

  // 空调运行策略进度 strategyList
  public strategyShowList: ACC_IStrategyProcessItem;
  public get strategyList(): ACC_IStrategyProcessItem {
    this.strategyShowList = this.accDatabaseService.refStrategyProcess$.value;
    return this.strategyShowList;
  }

  public set setStrategyList(data: ACC_IStrategyProcessItem) {
    this.strategyShowList = data;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private accCommunicationService: AirConditionerControlCommunicationService,
    private accDatabaseService: AirConditionerControlDatabaseService,
    private message: NzMessageService
  ) {
    // 空调运行优化侧率 今日 数据
    // this.accCommunicationService.queryTodayStrategy();

    this._subscriptions.push(
      this.accDatabaseService.refStrategyProcess$.subscribe(() => {
        switch (this.accDatabaseService.refStrategyProcess$.state) {
          case 'success':
            break;
          case 'error':
            if (
              !this.accDatabaseService.refStrategyProcess$.message?.includes(
                'login'
              )
            ) {
              this.message.error(
                `查询失败，${this.accDatabaseService.refStrategyProcess$.message}`
              );
            }
            break;
          default:
            break;
        }
      })
    );

    this.accDatabaseService.refMoreStrategy$.next(null);
  }
  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
  /**
   * 策略执行进度
   * @param param
   */
  public queryStrategyProcessList(param: number) {
    this.accCommunicationService.queryStrategyProcess(param);
  }
}
