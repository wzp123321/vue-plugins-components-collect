import { Injectable } from '@angular/core';
import { F_IBenchmarkItem } from '../../freezer.api';
import { FreezerDatabaseService } from '../../service/freezer-database.service';

@Injectable()
export class FreezerSingleBenchmarkingService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refBenchmarkValues$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refBenchmarkValues$.isEmpty;
  }

  public get standards(): F_IBenchmarkItem[] {
    return this.sDatabase.refBenchmarkValues$.getValue()?.standards ?? [];
  }
  public get current(): Partial<F_IBenchmarkItem> {
    return this.sDatabase.refBenchmarkValues$.getValue()?.current ?? {};
  }

  constructor(private sDatabase: FreezerDatabaseService) {
    this.sDatabase.refBenchmarkValues$.next(null);
  }
}
