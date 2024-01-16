import { Injectable, OnDestroy } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { F_IAnalysisSeriesItem, F_IOptionItem } from '../../freezer.api';
import { FreezerCommunicationService } from '../../service/freezer-communication.service';
import { FreezerDatabaseService } from '../../service/freezer-database.service';

@Injectable()
export class FreezerMultipleAnalysisService extends PaginationService implements OnDestroy {
  public get isLoading(): boolean {
    return (
      this.sDatabase.refEfficiencyNodes$.isLoading ||
      this.sDatabase.refParameterTypes$.isLoading ||
      this.sDatabase.refAnalysisValues$.isLoading
    );
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

  public get series(): F_IAnalysisSeriesItem[] {
    return this.sDatabase.refAnalysisValues$.getValue()?.series ?? [];
  }

  public get paramOptions(): F_IOptionItem<string>[] {
    return this.sDatabase.refParameterTypes$.getValue() ?? [];
  }

  private _param: string;
  public set param(v: string) {
    if (v === this._param) {
      return;
    }

    this._param = v;
    this.doRetrieve();
  }
  public get param(): string {
    return this._param;
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

  constructor(private sCommunication: FreezerCommunicationService, private sDatabase: FreezerDatabaseService) {
    super();

    this._subscriptions.push(
      this.sDatabase.refParameterTypes$.subscribe((options) => {
        this.param = null;
        if (options?.length) {
          this.param = options[0].value;
        }
      }),
      this.sDatabase.refAnalysisValues$.subscribe(() => {
        this.index = 1;
        this.size = 10;
      })
    );

    this.sDatabase.refAnalysisValues$.next(null);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.sDatabase.refParameterTypes$.next(null);
  }

  public doExport(): void {
    this.sCommunication.exportEfficiencyAnalysis(this.param);
  }

  private doRetrieve(): void {
    if (this.param) {
      this.sCommunication.queryEfficiencyAnalysis(this.param);
      this.sCommunication.queryParameterRank(this.param);
    }
  }
}
