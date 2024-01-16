import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EE_IChartEventItem } from '../energy-event.api';
import { EnergyEventCommunicationService } from '../service/energy-event-communication.service';
import { EnergyEventDatabaseService } from '../service/energy-event-database.service';

@Injectable()
export class EnergyEventChartService implements OnDestroy {
  public get onDataLoad(): EventEmitter<boolean> {
    return this.sDatabase.Event_Chart_DataLoad;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_SearchBar_Searching || this.sDatabase.State_Chart_Searching;
  }

  public get unit(): string {
    return this.sDatabase.Data_Unit_Cost;
  }

  public get zoom(): [Date, Date] {
    return this.sDatabase.Data_Chart_Zoom;
  }

  public get series(): [Date, number][] {
    return this.sDatabase.Data_Chart_Series;
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

  public getEvents(key: number): EE_IChartEventItem[] {
    return this.sDatabase.Data_Chart_Events.get(key) ?? [];
  }

  public doRetrieve(): void {
    this.sCommunication.queryEventTimeAxisChart(this.sDatabase.Data_SearchBar);
  }
}
