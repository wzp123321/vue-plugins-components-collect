import { Injectable } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { ML_IMeasureItem } from '../measure-library.api';
import { MeasureLibraryCommunicationService } from '../services/measure-library-communication.service';
import { MeasureLibraryDatabaseService } from '../services/measure-library-database.service';

@Injectable()
export class MeasureLibraryTableService extends PaginationService {
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

  public get list(): ML_IMeasureItem[] {
    return this.sDatabase.Data_Table_List;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private sCommunication: MeasureLibraryCommunicationService,
    private sDatabase: MeasureLibraryDatabaseService
  ) {
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

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doRetrieve(): void {
    this.sCommunication.getEnergyManagerMeasureList(this.sDatabase.Data_SearchBar);
  }

  public doDelete(id: number): void {
    this.sCommunication.deleteEnergyManagerMeasure(id);
  }
}
