import { Injectable } from '@angular/core';
import { F_IPowerItem } from '../../freezer.api';
import { FreezerDatabaseService } from '../../service/freezer-database.service';

@Injectable()
export class FreezerSingleOverviewService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refPowerValues$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refPowerValues$.isEmpty;
  }

  public get values(): Partial<F_IPowerItem> {
    return this.sDatabase.refPowerValues$.getValue() ?? {};
  }

  constructor(private sDatabase: FreezerDatabaseService) {
    this.sDatabase.refPowerValues$.next(null);
  }
}
