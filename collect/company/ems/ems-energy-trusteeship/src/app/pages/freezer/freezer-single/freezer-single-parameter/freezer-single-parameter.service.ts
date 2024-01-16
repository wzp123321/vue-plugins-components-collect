import { Injectable } from '@angular/core';
import { F_IParameterItem } from '../../freezer.api';
import { FreezerDatabaseService } from '../../service/freezer-database.service';

@Injectable()
export class FreezerSingleParameterService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refParameterList$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refParameterList$.isEmpty;
  }

  public get list(): F_IParameterItem[] {
    return this.sDatabase.refParameterList$.getValue() ?? [];
  }

  constructor(private sDatabase: FreezerDatabaseService) {
    this.sDatabase.refParameterList$.next(null);
  }
}
