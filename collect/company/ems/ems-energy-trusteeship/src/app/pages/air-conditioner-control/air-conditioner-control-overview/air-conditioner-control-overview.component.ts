import { Component, OnInit, Self } from '@angular/core';
import { ACC_IOverviewDetailItem } from '../air-conditioner-control.api';
import { AirConditionerControlOverviewService } from './air-conditioner-control-overview.service';

@Component({
  selector: 'ems-air-conditioner-control-overview',
  templateUrl: './air-conditioner-control-overview.component.html',
  styleUrls: ['./air-conditioner-control-overview.component.less'],
  providers: [AirConditionerControlOverviewService],
})
export class AirConditionerControlOverviewComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get range(): string {
    return this.service.range;
  }

  public get space(): ACC_IOverviewDetailItem {
    return this.service.space as ACC_IOverviewDetailItem;
  }

  public get cost(): ACC_IOverviewDetailItem {
    return this.service.cost as ACC_IOverviewDetailItem;
  }

  constructor(@Self() private service: AirConditionerControlOverviewService) {}

  ngOnInit(): void {}
}
