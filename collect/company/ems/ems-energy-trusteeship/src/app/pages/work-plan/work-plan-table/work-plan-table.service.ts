import { Injectable } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { WorkPlanCommunicationService } from '../services/work-plan-communication.service';
import { WorkPlanDatabaseService } from '../services/work-plan-database.service';
import { WP_EPlanState, WP_IPlanItem } from '../work-plan.api';

@Injectable()
export class WorkPlanTableService extends PaginationService {
  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Searching || this.sDatabase.State_Form_Saving;
  }

  public set index(v: number) {
    if (v === this.index) {
      return;
    }

    this.sDatabase.Data_SearchBar_Index = v;
    this.sDatabase.Event_Table_PaginationChange.emit();
  }
  public get index(): number {
    return this.sDatabase.Data_SearchBar_Index;
  }

  public set size(v: number) {
    if (v === this.size) {
      return;
    }

    this.sDatabase.Data_SearchBar_Size = v;
    this.sDatabase.Event_Table_PaginationChange.emit();
  }
  public get size(): number {
    return this.sDatabase.Data_SearchBar_Size;
  }

  public get total(): number {
    return this.sDatabase.Data_Table_Total;
  }

  public get list(): WP_IPlanItem[] {
    return this.sDatabase.Data_Table_List;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: WorkPlanCommunicationService, private sDatabase: WorkPlanDatabaseService) {
    super();

    this._subscriptions.push(
      this.sDatabase.Event_Table_PaginationChange.pipe(debounceTime(233)).subscribe(() => this.doRetrieve()),
      this.sDatabase.Event_Form_DataChange.subscribe(({ success, reset, drop }) => {
        if (success && !reset) {
          if (drop && this.list.length === 1 && this.index > 1) {
            this.sDatabase.Data_SearchBar_Index--;
          }
          this.doRetrieve();
        }
      })
    );
  }

  public doRetrieve(): void {
    this.sCommunication.queryWorkPlanList(this.sDatabase.Data_SearchBar);
  }

  public doDelete(id: number): void {
    this.sCommunication.deleteWorkPlan(id);
  }

  public doUpdateState(id: number, state: WP_EPlanState.正在执行 | WP_EPlanState.暂停) {
    this.sCommunication.updatePlanStatus(id, state);
  }
}
