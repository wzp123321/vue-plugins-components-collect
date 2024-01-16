import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Self, ViewChild } from '@angular/core';
import { F_IParameterItem } from '../../freezer.api';
import { FreezerSingleParameterService } from './freezer-single-parameter.service';

@Component({
  selector: 'ems-freezer-single-parameter',
  templateUrl: './freezer-single-parameter.component.html',
  styleUrls: ['./freezer-single-parameter.component.less'],
  providers: [FreezerSingleParameterService],
})
export class FreezerSingleParameterComponent implements OnInit, OnDestroy {
  @ViewChild('elementTableBody', { static: true })
  private refTableBody: ElementRef<HTMLDivElement>;

  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get list(): F_IParameterItem[] {
    return this.service.list;
  }

  public isOverflow = false;

  private _onResize$ = new ResizeObserver((entries) => {
    this.isOverflow = entries[0]?.target.scrollHeight > entries[0]?.target.clientHeight;
    this.cdr.detectChanges();
  });

  constructor(private cdr: ChangeDetectorRef, @Self() private service: FreezerSingleParameterService) {}

  ngOnInit(): void {
    this._onResize$.observe(this.refTableBody.nativeElement);
  }

  ngOnDestroy(): void {
    this._onResize$.disconnect();
  }

  public mapIsOutOfRange(item: F_IParameterItem): boolean {
    if (!item?.average) {
      return false;
    }

    const lower = item.min ? +item.average < +item.min : false;
    const higher = item.max ? +item.average > +item.max : false;
    return lower || higher;
  }
}
