import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EE_IDetailInfo, EE_IDetailTable } from '../energy-event.api';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

@Injectable()
export class EnergyEventDetailService implements OnDestroy {
  private _item: EE_IDetailInfo = { type: null, title: null, from: null };
  public get item(): EE_IDetailInfo {
    return this._item;
  }

  private _table: EE_IDetailTable = { header: [], body: [] };
  public get table(): EE_IDetailTable {
    return this._table;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_Detail_Searching;
  }
  public get isDownloading(): boolean {
    return this.sDatabase.State_Detail_Downloading;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: EnergyEventCommunicationService, private sDatabase: EnergyEventDatabaseService) {
    this._subscriptions.push(
      this.sDatabase.Event_Detail_DataLoad.subscribe((data) => {
        if (data?.item) {
          this._item = data.item;
        } else {
          this._item = { type: null, title: null, from: null };
        }

        if (data?.table) {
          this._table = data.table;
        } else {
          this._table = { header: [], body: [] };
        }
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doRetrieve(id: number): void {
    this.sCommunication.queryEventDetails(id);
  }

  public doDownload(url: string, name?: string): void {
    this.sCommunication.download(url, name);
  }
}
