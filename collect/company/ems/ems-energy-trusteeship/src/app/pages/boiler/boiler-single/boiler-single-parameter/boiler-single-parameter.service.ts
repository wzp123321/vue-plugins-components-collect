import { Injectable } from '@angular/core';
import { B_IParameterItem } from '../../boiler.api';
import { BoilerDatabaseService } from '../../service/boiler-database.service';

@Injectable()
export class BoilerSingleParameterService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refParameterList$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refParameterList$.isEmpty;
  }

  public get list(): B_IParameterItem[] {
    return this.sDatabase.refParameterList$.getValue() ?? [];
  }

  constructor(private sDatabase: BoilerDatabaseService) {
    this.sDatabase.refParameterList$.next(null);
  }
}
