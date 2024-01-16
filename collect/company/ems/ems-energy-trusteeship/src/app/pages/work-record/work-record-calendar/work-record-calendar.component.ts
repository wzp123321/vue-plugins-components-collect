import { Component, EventEmitter, OnDestroy, OnInit, Self } from '@angular/core';
import { map, Subscription, throttleTime } from 'rxjs';
import { WR_EWeek_Options, WR_IWorkPreview } from '../work-record.api';
import { WorkRecordCalendarService } from './work-record-calendar.service';

let YEAR_OPTIONS = [...new Array(new Date().getFullYear() - 1960).keys()].map((v) => {
  return { label: `${v + 1970}年`, value: v + 1970 };
});
const MONTH_OPTIONS = [...new Array(12).keys()].map((v) => {
  return { label: `${v + 1}月`, value: v };
});

@Component({
  selector: 'ems-work-record-calendar',
  templateUrl: './work-record-calendar.component.html',
  styleUrls: ['./work-record-calendar.component.less'],
  providers: [WorkRecordCalendarService],
})
export class WorkRecordCalendarComponent implements OnInit, OnDestroy {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isToday(): boolean {
    return this.service.isToday;
  }

  public get calendar(): WR_IWorkPreview[] {
    if (this.service.calendar?.length === 42) {
      return this.service.calendar;
    }
    return this._days;
  }

  private _current = new Date();
  public set year(v: number) {
    if (v === this._current.getFullYear()) {
      return;
    }

    this._current.setFullYear(v);
    this.mapCalendarDays();
  }
  public get year(): number {
    return this._current.getFullYear();
  }
  public set month(v: number) {
    if (v === this._current.getMonth()) {
      return;
    }

    this._current.setMonth(v);
    this.mapCalendarDays();
  }
  public get month(): number {
    return this._current.getMonth();
  }

  private _days: WR_IWorkPreview[] = new Array(42);

  public get yearOptions(): { label: string; value: number }[] {
    return YEAR_OPTIONS;
  }

  public get monthOptions(): { label: string; value: number }[] {
    return MONTH_OPTIONS;
  }

  public get weekOptions(): { label: string; value: number }[] {
    return WR_EWeek_Options;
  }

  public readonly onWheelScroll = new EventEmitter<WheelEvent>();

  private _subscriptions: Subscription[] = [];

  constructor(@Self() private service: WorkRecordCalendarService) {}

  ngOnInit(): void {
    this._subscriptions.push(
      this.onWheelScroll
        .pipe(
          map((event) => event?.deltaY && event.deltaY),
          throttleTime(666)
        )
        .subscribe((v) => {
          if (this.isLoading) {
            return;
          }

          if (v > 0) {
            this._current.setMonth(this.month + 1);
          } else {
            this._current.setMonth(this.month - 1);
          }
          this.mapCalendarDays();
        })
    );

    this.mapCalendarDays();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public selectDate(date: Date): void {
    if (!date) {
      return;
    }

    if (date.getFullYear() === this.year && date.getMonth() === this.month) {
      this._current.setDate(date.getDate());
    } else {
      this._current = new Date(date);
      this.mapCalendarDays();
    }
    this.service.date = new Date(date);
  }

  public selectToday(): void {
    this.selectDate(new Date());
    YEAR_OPTIONS = [...new Array(new Date().getFullYear() - 1960).keys()].map((v) => {
      return { label: `${v + 1970}年`, value: v + 1970 };
    });
  }

  public addYearOptions(): void {
    const last = YEAR_OPTIONS.pop()?.value ?? new Date().getFullYear();
    YEAR_OPTIONS.push(
      ...[...new Array(10).keys()].map((v) => {
        return { label: `${v + last}年`, value: v + last };
      })
    );
  }

  public resetYearOptions(open: boolean): void {
    if (open) {
      return;
    }

    const length = this.year - 1960;
    if (YEAR_OPTIONS.length > length) {
      YEAR_OPTIONS.length = length;
    }
  }

  public mapToday(date: Date): boolean {
    if (!date) {
      return false;
    }

    return date.toLocaleDateString() === new Date().toLocaleDateString();
  }

  public mapHistoricalDate(date: Date): boolean {
    if (!date) {
      return false;
    }

    return new Date(date.toLocaleDateString()) < new Date(new Date().toLocaleDateString());
  }

  public mapSameMonth(date: Date): boolean {
    if (!date) {
      return false;
    }

    return date.getMonth() === this.month;
  }

  public mapSelected(date: Date): boolean {
    if (!date) {
      return false;
    }

    return date.toLocaleDateString() === this.service.date.toLocaleDateString();
  }

  public mapScoreSymbol(score: number = 0): string {
    let flag = 'none';

    if (score < 60) {
      flag = 'low';
    } else if (score >= 90) {
      flag = 'high';
    } else {
      flag = 'middle';
    }

    return `assets/icon/work-record/wr-score-${flag}.svg`;
  }

  private mapCalendarDays(): void {
    const last = new Date(this.year, this.month, 0).getDay();
    this._days = Array.from({ length: 42 }, (v, k) => {
      return { date: new Date(this.year, this.month, k + 1 - last) };
    });

    this.service.doGetWorkCalendar(this._days[0].date, this._days[41].date);
  }
}
