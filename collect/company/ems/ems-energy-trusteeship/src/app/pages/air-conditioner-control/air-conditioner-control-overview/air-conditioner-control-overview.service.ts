import { Injectable } from '@angular/core';
import { ACC_IOverviewDetailItem } from '../air-conditioner-control.api';
import { AirConditionerControlDatabaseService } from '../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlOverviewService {
  public get isLoading(): boolean {
    return this.sDatabase.refOverview$.isLoading;
  }

  public get range(): string {
    return this.sDatabase.refOverview$.value?.range;
  }

  public get space(): Partial<ACC_IOverviewDetailItem> {
    return this.sDatabase.refOverview$.value?.space ?? { title: '节能空间' };
  }

  public get cost(): Partial<ACC_IOverviewDetailItem> {
    return this.sDatabase.refOverview$.value?.cost ?? { title: '节能费用' };
  }

  constructor(private sDatabase: AirConditionerControlDatabaseService) {}
}
