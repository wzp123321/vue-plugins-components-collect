import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EnergyEventCommunicationService } from './service/energy-event-communication.service';
import { EnergyEventDatabaseService } from './service/energy-event-database.service';

@Injectable()
export class EnergyEventService implements OnDestroy {
  private _isEmpty = true;
  public get isEmpty(): boolean {
    return this._isEmpty;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Searching;
  }

  public get isSaving(): boolean {
    return this.sDatabase.State_Form_Saving;
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: EnergyEventCommunicationService, private sDatabase: EnergyEventDatabaseService) {
    this._subscriptions.push(
      this.sDatabase.Event_SearchBar_DataComfirm.subscribe((success) => {
        this._isEmpty = !success;

        if (success) {
          this.doRetrieve();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private doRetrieve(): void {
    this.sCommunication.queryTotalEnergyUnit();
  }
}
