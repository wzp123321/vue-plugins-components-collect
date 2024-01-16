import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import { CSearchBarItem_DatePicker } from 'src/app/common/components/search-bar/search-bar.api';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

const SEARCH_BAR_ITEMS = {
  EVENT_DATE: new CSearchBarItem_DatePicker('事件日期', new Date(), 'year'),
};

@Injectable()
export class EnergyEventSearchService
  extends SearchBarService
  implements OnDestroy
{
  public get isLoading(): boolean {
    return (
      this.sDatabase.State_SearchBar_Initializing ||
      this.sDatabase.State_SearchBar_Searching
    );
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private sCommunication: EnergyEventCommunicationService,
    private sDatabase: EnergyEventDatabaseService
  ) {
    super([SEARCH_BAR_ITEMS.EVENT_DATE]);

    this._subscriptions.push(
      this.sDatabase.Event_Cards_TypeSelect.pipe(debounceTime(233)).subscribe(
        (type) => this.syncModel()
      ),
      this.sDatabase.Event_Table_PaginationChange.pipe(
        debounceTime(233)
      ).subscribe(() => this.syncModel()),
      this.sDatabase.Event_Form_DataChange.subscribe(
        ({ success, reset, drop }) => {
          if (success) {
            this.syncModel();

            if (reset) {
              this.doSearch();
            } else {
              if (
                drop &&
                this.sDatabase.Data_Table_List.length === 1 &&
                this.sDatabase.Data_SearchBar_Index > 1
              ) {
                this.sDatabase.Data_SearchBar_Index--;
              }
              this.doRetrieve();
            }
          }
        }
      )
    );

    this.initSearchBarItems().then(() => {
      if (window.sessionStorage.getItem('ems-anomaly-event-params')) {
        const parseParams = JSON.parse(
          window.sessionStorage.getItem('ems-anomaly-event-params') ?? '{}'
        );
        if (parseParams?.energyEventCreateTime) {
          this.items[0].model = new Date(parseParams?.energyEventCreateTime);
        }
      }
      this.doSearch();
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doSearch(): void {
    this.sDatabase.setSearchBarData({ date: this.items[0].model });
    this.sCommunication.isHaveData(this.sDatabase.Data_SearchBar);
  }

  private doRetrieve(): void {
    this.sCommunication.isHaveData(this.sDatabase.Data_SearchBar);
  }

  private syncModel(): void {
    this.items[0].model = this.sDatabase.Data_SearchBar.date;
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
