import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ACC_ICardSeriesItem } from '../../air-conditioner-control.api';
import { AirConditionerControlCommunicationService } from '../../service/air-conditioner-control-communication.service';
import { AirConditionerControlDatabaseService } from '../../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlCardsChartService {
  public get isLoading(): boolean {
    return this.sDatabase.refMonthChart$.isLoading;
  }

  public get onData(): Observable<boolean> {
    return this.sDatabase.refMonthChart$.pipe(map((v) => !!v));
  }

  public get title(): string {
    return this.sDatabase.refMonthChart$.value?.title;
  }

  public get dates(): Date[] {
    return this.sDatabase.refMonthChart$.value?.dates ?? [];
  }

  public get series(): Partial<ACC_ICardSeriesItem> {
    return this.sDatabase.refMonthChart$.value?.series ?? {};
  }

  constructor(
    private sCommunication: AirConditionerControlCommunicationService,
    private sDatabase: AirConditionerControlDatabaseService
  ) {}

  public doRetrieve(code: string | number): void {
    switch (typeof code) {
      case 'string':
        this.sCommunication.queryParamChart(code);
        break;
      case 'number':
        this.sCommunication.queryLoadRateChart(code);
        break;
      default:
        break;
    }
  }
}
