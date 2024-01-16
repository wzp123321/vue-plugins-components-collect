import { ChangeDetectorRef, Component, ElementRef, Input, OnInit } from '@angular/core';
import { AirConditionerControlListService } from '../air-conditioner-control-list.service';
import { AirConditionerControlListMoreService } from './air-conditioner-control-list-more.service';
import { DatePipe } from '@angular/common';
import { ACC_IStrategyItem } from '../../air-conditioner-control.api';
@Component({
  selector: 'ems-air-conditioner-control-list-more',
  templateUrl: './air-conditioner-control-list-more.component.html',
  styleUrls: ['./air-conditioner-control-list-more.component.less'],
  providers: [AirConditionerControlListMoreService, DatePipe],
})
export class AirConditionerControlListMoreComponent implements OnInit {
  isVisible: boolean = false;
  isOkLoading: boolean = false;
  dateArray: any = [];
  dateArrayChange: any = [];
  public get dateArrayInit(): any {
    return this.acclMoreService.dateArray;
  }
  public get date(): Date {
    return this.accListService.date;
  }

  // 不可选择范围
  disabledDate = (current: Date) => {
    const dateInit = this.dateArrayInit ? this.dateArrayInit[1] : new Date();
    return new Date(current.toLocaleDateString()) > new Date(new Date(dateInit).toLocaleDateString());
  };

  public get loading(): boolean {
    return this.acclMoreService.loading;
  }

  public get isEmpty(): boolean {
    return this.acclMoreService.empty;
  }

  public get moreStrategyData(): Array<{ date: string; list: ACC_IStrategyItem[] }> {
    return this.acclMoreService.list;
  }

  public get isInvalid(): boolean {
    return this.acclMoreService.isInvalid;
  }
  constructor(
    private accListService: AirConditionerControlListService,
    private acclMoreService: AirConditionerControlListMoreService,
    private datePipe: DatePipe,
    private elementRef: ElementRef,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}
  showListMoreModal() {
    this.acclMoreService.clearData();
    if (this.dateArrayInit) {
      this.dateArray = [this.dateArrayInit[0], this.dateArrayInit[1]];
      this.querryList();
    } else {
      this.dateArray = [];
    }

    this.isVisible = true;
  }
  handleCancel() {
    this.dateArray = [];
    this.isVisible = false;
  }

  onChange(item: any) {
    if (item && item.length > 0) {
      if (
        new Date(new Date(item[1]).toLocaleDateString()) >
        new Date(item[0].getFullYear(), item[0].getMonth(), item[0].getDate() + 30)
      ) {
        this.dateArray = this.dateArrayChange;
      } else {
        this.dateArray = item;
      }
    } else {
      this.disabledDate = (current: Date) => {
        const dateInit = this.dateArrayInit ? this.dateArrayInit[1] : new Date();
        return new Date(current.toLocaleDateString()) > new Date(new Date(dateInit).toLocaleDateString());
      };
      this.dateArray = item;
    }
   this.cd.detectChanges();
  }

  onCalendarChange(item: Date[]) {
    const end = new Date(item[0].getFullYear(), item[0].getMonth(), item[0].getDate() + 30);
    const toDate = this.dateArrayInit ? this.dateArrayInit[1] : new Date();
    const today = new Date(new Date(toDate).toLocaleDateString());
    const endValue = end > today ? today : end;
    this.disabledDate = (current: Date) => {
      const end =
        new Date(item[0].getFullYear(), item[0].getMonth(), item[0].getDate() + 30) >
        new Date(toDate.toLocaleDateString())
          ? new Date(toDate.toLocaleDateString())
          : new Date(item[0].getFullYear(), item[0].getMonth(), item[0].getDate() + 30);

      return (
        new Date(current.toLocaleDateString()) > new Date(new Date(toDate).toLocaleDateString()) ||
        new Date(current.toLocaleDateString()) > end
      );
    };
    if (
      new Date(new Date(endValue).toLocaleDateString()) >
      new Date(item[0].getFullYear(), item[0].getMonth(), item[0].getDate() + 30)
    ) {
    }
    this.dateArray = [item[0], endValue];
    this.dateArrayChange = [item[0], endValue];
  }

  toSearch() {
    this.querryList();
  }

  querryList() {
    const param = {
      endTime: this.dateArray && this.dateArray.length > 0 ? this.dateArray[1] : '',

      startTime: this.dateArray && this.dateArray.length > 0 ? this.dateArray[0] : '',
    };
    this.acclMoreService.queryMoreOptimizationStrategy(param);
  }

  // 下标
  trackByIndex(index: number) {
    return index;
  }
}
