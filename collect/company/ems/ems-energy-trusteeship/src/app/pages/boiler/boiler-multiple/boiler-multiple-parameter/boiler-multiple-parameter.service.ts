import { Injectable } from '@angular/core';
import { B_IParameterItem } from '../../boiler.api';
import { BoilerDatabaseService } from '../../service/boiler-database.service';

@Injectable()
export class BoilerMultipleParameterService {
  public get isLoading(): boolean {
    return (
      this.sDatabase.refEfficiencyNodes$.isLoading ||
      this.sDatabase.refParameterTypes$.isLoading ||
      this.sDatabase.refParameterRank$.isLoading
    );
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refParameterRank$.isEmpty;
  }

  public get param(): string {
    return this.sDatabase.refParameterRank$.getValue()?.param;
  }

  public get list(): B_IParameterItem[] {
    return this.sDatabase.refParameterRank$.getValue()?.list ?? [];
  }

  constructor(private sDatabase: BoilerDatabaseService) {
    this.sDatabase.refParameterRank$.next(null);
  }
}
