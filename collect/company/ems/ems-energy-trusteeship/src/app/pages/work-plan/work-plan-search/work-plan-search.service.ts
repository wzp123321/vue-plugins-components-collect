import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import { CSearchBarItem_Input, CSearchBarItem_Select } from 'src/app/common/components/search-bar/search-bar.api';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { WorkPlanCommunicationService } from '../services/work-plan-communication.service';
import { WorkPlanDatabaseService } from '../services/work-plan-database.service';
import { WP_EPlanState, WP_EPlanState_Options } from '../work-plan.api';

const SEARCH_BAR_ITEMS = {
  PLAN_NAME: new CSearchBarItem_Input('计划名称', null, 20, { placeholder: '请输入计划名称' }),
  PLAN_CODE: new CSearchBarItem_Input('计划编码', null, 20, { placeholder: '请输入计划编码' }),
  PLAN_STATE: new CSearchBarItem_Select('计划状态', WP_EPlanState.全部, WP_EPlanState_Options),
};

@Injectable()
export class WorkPlanSearchService extends SearchBarService implements OnDestroy {
  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Initializing || this.sDatabase.State_SearchBar_Searching;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: WorkPlanCommunicationService, private sDatabase: WorkPlanDatabaseService) {
    super([SEARCH_BAR_ITEMS.PLAN_NAME, SEARCH_BAR_ITEMS.PLAN_CODE, SEARCH_BAR_ITEMS.PLAN_STATE]);

    this._subscriptions.push(
      this.sDatabase.Event_Table_PaginationChange.pipe(debounceTime(233)).subscribe(() => this.syncModel()),
      this.sDatabase.Event_Form_DataChange.subscribe(({ success, reset }) => {
        if (success && reset) {
          this.syncModel();
          this.doSearch();
        }
      })
    );

    this.initSearchBarItems().then(() => this.doSearch());
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doSearch(): void {
    this.sDatabase.setSearchBarData({
      name: this.items[0].model,
      code: this.items[1].model,
      state: this.items[2].model,
    });
    this.sCommunication.queryWorkPlanList(this.sDatabase.Data_SearchBar);
  }

  private syncModel(): void {
    this.items[0].model = this.sDatabase.Data_SearchBar.name;
    this.items[1].model = this.sDatabase.Data_SearchBar.code;
    this.items[2].model = this.sDatabase.Data_SearchBar.state;
  }

  private async initSearchBarItems(): Promise<void> {
    try {
      this.sDatabase.State_SearchBar_Initializing = true;
    } catch (error) {
      console.warn(error);
    } finally {
      this.sDatabase.State_SearchBar_Initializing = false;
    }
  }
}
