import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ACC_ISystemItem } from './air-conditioner-control.api';
import { AirConditionerControlCommunicationService } from './service/air-conditioner-control-communication.service';
import { AirConditionerControlDatabaseService } from './service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlService implements OnDestroy {
  public get isLoading(): boolean {
    return this.sDatabase.refSystemList$.isLoading || this.sDatabase.refModeName$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refSystemList$.isEmpty;
  }

  public get systemList(): ACC_ISystemItem[] {
    return this.sDatabase.refSystemList$.value;
  }

  public get title(): string {
    return this.sDatabase.refModeName$.value ?? 'PLC自动模式';
  }

  private _system: number;
  public set system(v: number) {
    this._system = v;
    this.doRetrieve();
  }
  public get system(): number {
    return this._system;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private sCommunication: AirConditionerControlCommunicationService,
    private sDatabase: AirConditionerControlDatabaseService
  ) {
    this._subscriptions.push(
      this.sDatabase.refSystemList$.subscribe((list) => list?.length && (this.system = list[0].id))
    );

    this.sCommunication.querySystemList();
    this.sCommunication.queryModeName();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doRetrieve(): void {
    if (this.system) {
      this.sDatabase.dataQuery = { system: this.system };

      this.sCommunication.queryParamCardList();
      this.sCommunication.queryLoadRateCard();
      this.sCommunication.queryOverview();
      this.sCommunication.queryPredictChart();
      this.sCommunication.queryStatisticsChart();
      this.sCommunication.queryTodayStrategy();
    }
  }
}
