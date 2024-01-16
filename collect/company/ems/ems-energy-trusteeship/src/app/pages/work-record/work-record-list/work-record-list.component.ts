import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Self,
  ViewChild,
} from '@angular/core';
import {
  WR_EWeek,
  WR_EWorkState,
  WR_IWorkItem,
  WR_IWorkList,
} from '../work-record.api';
import { WorkRecordListService } from './work-record-list.service';

@Component({
  selector: 'ems-work-record-list',
  templateUrl: './work-record-list.component.html',
  styleUrls: ['./work-record-list.component.less'],
  providers: [WorkRecordListService],
})
export class WorkRecordListComponent implements OnInit, OnDestroy {
  @ViewChild('elementListBody', { static: true })
  private refListBody: ElementRef<HTMLDivElement>;

  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isHistory(): boolean {
    return this.service.isHistory;
  }
  public get isToday(): boolean {
    return this.service.isToday;
  }
  public get isFuture(): boolean {
    return this.service.isFuture;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public isOverflow = false;

  public get year(): number {
    return this.service.date.getFullYear();
  }
  public get month(): number {
    return this.service.date.getMonth() + 1;
  }
  public get day(): number {
    return this.service.date.getDate();
  }
  public get week(): string {
    return WR_EWeek[this.service.date.getDay()];
  }

  public get list(): WR_IWorkList {
    return this.service.list;
  }

  private _onResize = new ResizeObserver((entries) => {
    this.isOverflow =
      entries[0]?.target.scrollHeight > entries[0]?.target.clientHeight;
    this.cdr.detectChanges();
  });

  constructor(
    private cdr: ChangeDetectorRef,
    @Self() private service: WorkRecordListService
  ) {}

  ngOnInit(): void {
    this._onResize.observe(this.refListBody.nativeElement);
  }

  ngOnDestroy(): void {
    this._onResize.disconnect();
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

  public mapUndoneTask(state: WR_EWorkState): boolean {
    return state === WR_EWorkState.未完成 && !this.isToday && !this.isFuture;
  }

  public mapFinishedTask(state: WR_EWorkState): boolean {
    return state === WR_EWorkState.完成;
  }

  public mapDelayedTask(state: WR_EWorkState): boolean {
    return state === WR_EWorkState.延时完成;
  }

  public mapHistoricalTask(state: WR_EWorkState): boolean {
    return [WR_EWorkState.完成, WR_EWorkState.延时完成].includes(state);
  }

  public mapDeadlineTagTask(state: WR_EWorkState): boolean {
    return (
      (this.isToday &&
        (state === WR_EWorkState.待执行 || state === WR_EWorkState.未完成)) ||
      this.isFuture
    );
  }

  public mapItemIcon(state: WR_EWorkState): string {
    let className = '';
    if (this.isToday) {
      if (state === WR_EWorkState.未完成 || state === WR_EWorkState.待执行) {
        className = 'disabled';
      }
      if (state === WR_EWorkState.延时完成) {
        className = 'delay';
      }
      if (state === WR_EWorkState.完成) {
        className = 'done';
      }
    }
    if (this.isHistory) {
      if (state === WR_EWorkState.待执行) {
        className = 'disabled';
      }
      if (state === WR_EWorkState.完成) {
        className = 'done';
      }
      if (state === WR_EWorkState.延时完成) {
        className = 'delay';
      }
    }
    if (this.isFuture) {
      className = 'disabled';
    }

    return className;
  }

  public mapStateShow(state: WR_EWorkState): boolean {
    return (
      (this.isToday &&
        [WR_EWorkState.完成, WR_EWorkState.延时完成].includes(state)) ||
      (this.isHistory &&
        [
          WR_EWorkState.完成,
          WR_EWorkState.未完成,
          WR_EWorkState.延时完成,
        ].includes(state))
    );
  }

  public mapTaskState(state: WR_EWorkState): string {
    return WR_EWorkState[state];
  }

  public mapActiveTask(begin: Date, end: Date): boolean {
    if (begin && end) {
      const now = new Date();
      return begin <= now && now <= end;
    }
    return false;
  }

  public mapInfoVisibility(work: WR_IWorkItem): boolean {
    if (![WR_EWorkState.完成, WR_EWorkState.延时完成].includes(work.state)) {
      return false;
    }

    if (work.finish) {
      return true;
    }
    if (work.remark) {
      return true;
    }
    if (work.attaches?.length) {
      return true;
    }
    return false;
  }
}
