import { Injectable } from '@angular/core';
import { B_EfficiencyItem } from '../../boiler.api';
import { BoilerDatabaseService } from '../../service/boiler-database.service';

@Injectable()
export class BoilerSingleOverviewService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refEfficiencyValues$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refEfficiencyValues$.isEmpty;
  }

  public get values(): Partial<B_EfficiencyItem> {
    return this.sDatabase.refEfficiencyValues$.getValue() ?? {};
  }

  constructor(private sDatabase: BoilerDatabaseService) {
    this.sDatabase.refEfficiencyValues$.next(null);
  }
}
