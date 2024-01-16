import { Injectable } from '@angular/core';
import { WorkRecordCommunicationService } from '../services/work-record-communication.service';
import { WorkRecordDatabaseService } from '../services/work-record-database.service';
import { WR_IWorkPreview } from '../work-record.api';

@Injectable()
export class WorkRecordCalendarService {
  private _date = new Date();
  public set date(v: Date) {
    if (v.toLocaleDateString() === this._date.toLocaleDateString()) {
      return;
    }

    this._date = new Date(v);
    this.sDatabase.Event_Calendar_DateChange.emit(this._date);
  }
  public get date(): Date {
    return this._date;
  }

  public get calendar(): WR_IWorkPreview[] {
    return this.sDatabase.Data_Calendar;
  }

  public get isLoading(): boolean {
    return this.sDatabase.State_Calendar_Searching;
  }

  public get isToday(): boolean {
    return new Date().toLocaleDateString() === this._date.toLocaleDateString();
  }

  constructor(private sCommunication: WorkRecordCommunicationService, private sDatabase: WorkRecordDatabaseService) {}

  public doGetWorkCalendar(start: Date, end: Date): void {
    this.sCommunication.getEnergyManagerWorkList(start, end);
  }
}
