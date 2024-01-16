import { Component, OnInit } from '@angular/core';
import { AirConditionerControlListService } from './air-conditioner-control-list.service';
import { StrategyDetailType } from './air-conditioner-control-list.type';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'ems-air-conditioner-control-list',
  templateUrl: './air-conditioner-control-list.component.html',
  styleUrls: ['./air-conditioner-control-list.component.less'],
  providers: [AirConditionerControlListService, DatePipe],
})
export class AirConditionerControlListComponent implements OnInit {
  public get loading(): boolean {
    return this.accListService.loading;
  }

  public get todayOptimizationStrategyData(): StrategyDetailType[] {
    return this.accListService.list;
  }

  public get date(): string {
    return this.datePipe.transform(this.accListService.date, 'yyyy.MM.dd');
  }

  public get isEmpty(): boolean {
    return this.accListService.empty;
  }
  constructor(private accListService: AirConditionerControlListService, private datePipe: DatePipe) {}

  ngOnInit(): void {}
}
