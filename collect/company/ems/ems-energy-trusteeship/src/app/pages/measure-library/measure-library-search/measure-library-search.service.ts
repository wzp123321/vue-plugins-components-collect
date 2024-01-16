import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import { CSearchBarItem_Input, CSearchBarItem_Select } from 'src/app/common/components/search-bar/search-bar.api';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import {
  ML_EMeasureState,
  ML_EMeasureState_Options,
  ML_EMeasureSystem,
  ML_EMeasureSystem_Options,
} from '../measure-library.api';
import { MeasureLibraryCommunicationService } from '../services/measure-library-communication.service';
import { MeasureLibraryDatabaseService } from '../services/measure-library-database.service';

const SEARCH_BAR_ITEMS = {
  MEASURE_NAME: new CSearchBarItem_Input('措施名称', null, 20, { placeholder: '请输入措施名称' }),
  MEASURE_CODE: new CSearchBarItem_Input('措施编码', null, 20, { placeholder: '请输入措施编码' }),
  MEASURE_SYSTEM: new CSearchBarItem_Select('所属系统', ML_EMeasureSystem.全部, ML_EMeasureSystem_Options),
  MEASURE_STATE: new CSearchBarItem_Select('措施状态', ML_EMeasureState.全部, ML_EMeasureState_Options),
};

@Injectable()
export class MeasureLibrarySearchService extends SearchBarService implements OnDestroy {
  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Initializing || this.sDatabase.State_SearchBar_Searching;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private sCommunication: MeasureLibraryCommunicationService,
    private sDatabase: MeasureLibraryDatabaseService
  ) {
    super([
      SEARCH_BAR_ITEMS.MEASURE_NAME,
      SEARCH_BAR_ITEMS.MEASURE_CODE,
      SEARCH_BAR_ITEMS.MEASURE_SYSTEM,
      SEARCH_BAR_ITEMS.MEASURE_STATE,
    ]);

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
      system: this.items[2].model,
      state: this.items[3].model,
    });
    this.sCommunication.getEnergyManagerMeasureList(this.sDatabase.Data_SearchBar);
  }

  private syncModel(): void {
    this.items[0].model = this.sDatabase.Data_SearchBar.name;
    this.items[1].model = this.sDatabase.Data_SearchBar.code;
    this.items[2].model = this.sDatabase.Data_SearchBar.system;
    this.items[3].model = this.sDatabase.Data_SearchBar.state;
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
