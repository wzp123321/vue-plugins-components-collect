import { Injectable, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, map, Subscription } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { B_IAnalysisSeriesItem } from '../../boiler.api';
import { BoilerCommunicationService } from '../../service/boiler-communication.service';
import { BoilerDatabaseService } from '../../service/boiler-database.service';

@Injectable()
export class BoilerSingleAnalysisService extends PaginationService implements OnDestroy {
  public get isLoading(): boolean {
    return this.sDatabase.refEfficiencyNodes$.isLoading || this.sDatabase.refAnalysisValues$.isLoading;
  }

  public get isExporting(): boolean {
    return this.sDatabase.refAnalysisExport$.isLoading;
  }

  public get isEmpty(): boolean {
    return this.sDatabase.refAnalysisValues$.isEmpty;
  }

  public get onSearch(): Observable<void> {
    return this.sDatabase.refSearchEvent;
  }

  public get onData(): Observable<boolean> {
    return this.sDatabase.refAnalysisValues$.pipe(map((v) => !!v));
  }

  public get dates(): Date[] {
    return this.sDatabase.refAnalysisValues$.getValue()?.dates ?? [];
  }

  public get series(): B_IAnalysisSeriesItem[] {
    return this.sDatabase.refAnalysisValues$.getValue()?.series ?? [];
  }

  private _index = 1;
  public set index(v: number) {
    if (this.index === v) {
      return;
    }

    this._index = v;
  }
  public get index(): number {
    return this._index;
  }

  private _size = 10;
  public set size(v: number) {
    if (this.size === v) {
      return;
    }

    this._size = v;
  }
  public get size(): number {
    return this._size;
  }

  public get total(): number {
    return this.series.length ? this.dates.length : 0;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private nzMessage: NzMessageService,
    private sCommunication: BoilerCommunicationService,
    private sDatabase: BoilerDatabaseService
  ) {
    super();

    this._subscriptions.push(
      this.sDatabase.refAnalysisValues$.subscribe(() => {
        this.index = 1;
        this.size = 10;
      })
    );

    this.sDatabase.refAnalysisValues$.next(null);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doExport(): void {
    this.sCommunication.exportEfficiencyAnalysis();
  }
}
