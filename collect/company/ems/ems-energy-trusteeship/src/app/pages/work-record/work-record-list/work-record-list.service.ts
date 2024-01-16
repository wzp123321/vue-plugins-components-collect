import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WorkRecordCommunicationService } from '../services/work-record-communication.service';
import { WorkRecordDatabaseService } from '../services/work-record-database.service';
import { WR_IWorkItem, WR_IWorkList } from '../work-record.api';

@Injectable()
export class WorkRecordListService implements OnDestroy {
  private _date: Date = new Date();
  public get date(): Date {
    return this._date;
  }

  private _list: WR_IWorkList = { score: null, daily: [], weekly: [], monthly: [], special: [], other: [] };
  public get list(): WR_IWorkList {
    return this._list;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_List_Searching;
  }

  public get isHistory(): boolean {
    return new Date(new Date().toLocaleDateString()) > new Date(this._date.toLocaleDateString());
  }
  public get isToday(): boolean {
    return new Date().toLocaleDateString() === this._date.toLocaleDateString();
  }
  public get isFuture(): boolean {
    return new Date(new Date().toLocaleDateString()) < new Date(this._date.toLocaleDateString());
  }

  public get isEmpty(): boolean {
    return !(
      this.list.daily?.length +
      this.list.weekly?.length +
      this.list.monthly?.length +
      this.list.special?.length +
      this.list.other?.length
    );
  }

  private _subscriptions: Subscription[] = [];

  constructor(private sCommunication: WorkRecordCommunicationService, private sDatabase: WorkRecordDatabaseService) {
    this._subscriptions.push(
      this.sDatabase.Event_Calendar_DateChange.subscribe((date) => {
        if (date) {
          this._date = new Date(date);
          this.doGetWorkList();
        }
      }),
      this.sDatabase.Event_List_DataLoad.subscribe((list) => {
        if (list) {
          this._list = list;
        } else {
          this._list = { score: null, daily: [], weekly: [], monthly: [], special: [], other: [] };
        }
      })
    );

    this.doGetWorkList();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private doGetWorkList(): void {
    this.sCommunication.getEnergyManagerWorkDetail(this.date);
  }
}
