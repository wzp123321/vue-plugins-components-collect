import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ACC_IChartSeriesItem } from '../air-conditioner-control.api';
import { AirConditionerControlDatabaseService } from '../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlPredictService {
  public get isLoading(): boolean {
    return this.sDatabase.refPredictChart$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refPredictChart$.isEmpty;
  }

  public get onData(): Observable<boolean> {
    return this.sDatabase.refPredictChart$.pipe(map((v) => !!v));
  }

  public get message(): string {
    return this.sDatabase.refPredictChart$.message ?? '暂无数据';
  }

  public get unit(): string {
    return this.sDatabase.refPredictChart$.value?.unit;
  }

  public get dates(): Date[] {
    return this.sDatabase.refPredictChart$.value?.dates ?? [];
  }

  public get series(): ACC_IChartSeriesItem[] {
    return this.sDatabase.refPredictChart$.value?.series ?? [];
  }

  constructor(private sDatabase: AirConditionerControlDatabaseService) {}
}
