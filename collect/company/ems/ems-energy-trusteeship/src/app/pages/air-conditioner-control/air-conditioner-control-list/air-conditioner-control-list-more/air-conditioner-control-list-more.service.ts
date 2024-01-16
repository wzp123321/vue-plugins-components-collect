import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { ACC_IStrategyItem } from '../../air-conditioner-control.api';
import { AirConditionerControlCommunicationService } from '../../service/air-conditioner-control-communication.service';
import { AirConditionerControlDatabaseService } from '../../service/air-conditioner-control-database.service';
import { VerificationParamType } from '../air-conditioner-control-list.type';

@Injectable()
export class AirConditionerControlListMoreService {
  // 空调运行优化侧率 date
  public get date(): Date {
    return this.accDatabaseService.refTodayStrategy$.value?.date ?? null;
  }
  public get dateArray(): Date[] {
    let dateSection = [];
    if (this.accDatabaseService.refTodayStrategy$.value?.date) {
      const end = this.accDatabaseService.refTodayStrategy$.value?.date;
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 30);
      dateSection.push(start, end);
    } else {
      // const end = new Date();
      // const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 30);
      // dateSection.push(start, end);
      dateSection = null;
    }

    return dateSection;
  }

  public get loading(): boolean {
    return this.accDatabaseService.refMoreStrategy$.isLoading;
  }
  // 空调运行优化侧率 empty
  public get empty(): boolean {
    return this.accDatabaseService.refMoreStrategy$.isEmpty || !this.list.length;
  }

  // 空调运行优化侧率 list列表
  public get list(): Array<{ date: string; list: ACC_IStrategyItem[] }> {
    // console.log(this.accDatabaseService.refMoreStrategy$.value);
    return this.accDatabaseService.refMoreStrategy$.value ?? [];
  }

  private _subscriptions: Subscription[] = [];

  private _Invalid = false;
  public get isInvalid(): boolean {
    return this._Invalid;
  }
  constructor(
    private accCommunicationService: AirConditionerControlCommunicationService,
    private accDatabaseService: AirConditionerControlDatabaseService,
    private message: NzMessageService
  ) {
    // this._subscriptions.push(
    //   this.accDatabaseService.refMoreStrategy$.subscribe(() => {
    //     switch (this.accDatabaseService.refMoreStrategy$.state) {
    //       case 'success':
    //         break;
    //       case 'error':
    //         if (!this._Invalid) {
    //           this.message.error(`查询失败，${this.accDatabaseService.refMoreStrategy$.message}`);
    //         }

    //         break;
    //       default:
    //         break;
    //     }
    //   })
    // );
    this.accDatabaseService.refMoreStrategy$.next(null);
  }

  ngOnDestroy(): void {
    // this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public verificationParam(param: VerificationParamType) {
    this._Invalid = false;
    if (!param.endTime || !param.startTime) {
      this.message.error('时间不能为空！');
      this._Invalid = true;
      // return false;
    }
    return !this._Invalid;
  }

  public queryMoreOptimizationStrategy(param: VerificationParamType) {
    if (this.verificationParam(param)) {
      this.accCommunicationService.queryMoreStrategy(param.startTime, param.endTime);
    }
  }

  public clearData() {
    this.accDatabaseService.refMoreStrategy$.next(null);
  }
}
