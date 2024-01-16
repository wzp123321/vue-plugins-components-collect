import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EE_EEventType, EE_ICardItem } from '../energy-event.api';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

@Injectable()
export class EnergyEventCardsService implements OnDestroy {
  public set current(v: EE_EEventType) {
    this.sDatabase.Data_SearchBar_Type = v;
    this.sDatabase.Event_Cards_TypeSelect.emit(v);
  }
  public get current(): EE_EEventType {
    return this.sDatabase.Data_SearchBar_Type;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Searching || this.sDatabase.State_Cards_Searching;
  }

  public get unit(): string {
    return this.sDatabase.Data_Unit_Cost;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: EnergyEventCommunicationService, private sDatabase: EnergyEventDatabaseService) {
    this._subscriptions.push(
      this.sDatabase.Event_SearchBar_DataComfirm.subscribe((success) => success && this.doRetrieve())
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public getCard(key: EE_EEventType): EE_ICardItem {
    return this.sDatabase.Data_Cards.get(key) ?? { count: null };
  }

  private doRetrieve(): void {
    this.sCommunication.queryEventCardList(this.sDatabase.Data_SearchBar);
  }
}
