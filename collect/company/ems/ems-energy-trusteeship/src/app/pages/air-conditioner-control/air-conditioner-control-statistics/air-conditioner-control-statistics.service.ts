import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ACC_IChartSeriesItem } from '../air-conditioner-control.api';
import { AirConditionerControlDatabaseService } from '../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlStatisticsService {
  public get isLoading(): boolean {
    return this.sDatabase.refStatisticsChart$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refStatisticsChart$.isEmpty;
  }

  public get onData(): Observable<boolean> {
    return this.sDatabase.refStatisticsChart$.pipe(map((v) => !!v));
  }

  public get message(): string {
    return this.sDatabase.refStatisticsChart$.message ?? '暂无数据';
  }

  public get unit(): string {
    return this.sDatabase.refStatisticsChart$.value?.unit;
  }

  public get dates(): Date[] {
    return this.sDatabase.refStatisticsChart$.value?.dates ?? [];
  }

  public get series(): ACC_IChartSeriesItem[] {
    return this.sDatabase.refStatisticsChart$.value?.series ?? [];
  }

  constructor(private sDatabase: AirConditionerControlDatabaseService) {}
}
