import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { EE_EEventType, EE_IEventItem } from '../energy-event.api';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

@Injectable()
export class EnergyEventTableService extends PaginationService implements OnDestroy {
  public get type(): EE_EEventType {
    return this.sDatabase.Data_SearchBar_Type;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Searching || this.sDatabase.State_Table_Searching;
  }

  public get isSaving(): boolean {
    return this.sDatabase.State_Form_Saving;
  }

  public get isExporting(): boolean {
    return this.sDatabase.State_Table_Exporting;
  }

  public set index(v: number) {
    if (this.index === v) {
      return;
    }

    this.sDatabase.Data_SearchBar_Index = v;
    this.sDatabase.Event_Table_PaginationChange.emit();
  }
  public get index(): number {
    return this.sDatabase.Data_SearchBar_Index;
  }

  public set size(v: number) {
    if (this.size === v) {
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

  public get unit(): string {
    return this.sDatabase.Data_Unit_Cost;
  }

  public get list(): EE_IEventItem[] {
    return this.sDatabase.Data_Table_List;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: EnergyEventCommunicationService, private sDatabase: EnergyEventDatabaseService) {
    super();

    this._subscriptions.push(
      this.sDatabase.Event_SearchBar_DataComfirm.subscribe((success) => success && this.doRetrieve()),
      this.sDatabase.Event_Cards_TypeSelect.pipe(debounceTime(233)).subscribe((type) => {
        this.sDatabase.Data_SearchBar_Type = type;
        this.sDatabase.Data_SearchBar_Index = 1;
        this.sDatabase.Data_SearchBar_Size = 10;
        this.doRetrieve();
      }),
      this.sDatabase.Event_Table_PaginationChange.pipe(debounceTime(233)).subscribe(() => this.doRetrieve())
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doExport(): void {
    this.sCommunication.exportExcelEnergyEvent(this.sDatabase.Data_SearchBar);
  }

  public doDelete(id: number): void {
    this.sCommunication.deleteEvent(id);
  }

  private doRetrieve(): void {
    this.sCommunication.queryEventList(this.sDatabase.Data_SearchBar);
  }
}
