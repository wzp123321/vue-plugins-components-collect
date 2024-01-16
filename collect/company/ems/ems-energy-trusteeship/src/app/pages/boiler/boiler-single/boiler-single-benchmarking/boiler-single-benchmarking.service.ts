import { Injectable } from '@angular/core';
import { B_IBenchmarkItem } from '../../boiler.api';
import { BoilerDatabaseService } from '../../service/boiler-database.service';

@Injectable()
export class BoilerSingleBenchmarkingService {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refBenchmarkValues$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refBenchmarkValues$.isEmpty;
  }

  public get standards(): B_IBenchmarkItem[] {
    return this.sDatabase.refBenchmarkValues$.getValue()?.standards ?? [];
  }
  public get current(): Partial<B_IBenchmarkItem> {
    return this.sDatabase.refBenchmarkValues$.getValue()?.current ?? {};
  }

  constructor(private sDatabase: BoilerDatabaseService) {
    this.sDatabase.refBenchmarkValues$.next(null);
  }
}
