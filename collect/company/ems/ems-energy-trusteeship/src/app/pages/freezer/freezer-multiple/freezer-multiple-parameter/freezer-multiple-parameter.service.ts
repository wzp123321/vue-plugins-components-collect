import { Injectable } from '@angular/core';
import { F_IParameterItem } from '../../freezer.api';
import { FreezerDatabaseService } from '../../service/freezer-database.service';

@Injectable()
export class FreezerMultipleParameterService {
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

  public get list(): F_IParameterItem[] {
    return this.sDatabase.refParameterRank$.getValue()?.list ?? [];
  }

  constructor(private sDatabase: FreezerDatabaseService) {
    this.sDatabase.refParameterRank$.next(null);
  }
}
