import { Component, OnInit, SkipSelf } from '@angular/core';
import {
  WP_EExecutionPeriod,
  WP_EExecutionPeriod_Options,
  WP_ESkipHoliday,
  WP_ESkipHoliday_Options,
  WP_IPlanInfo,
} from '../../work-plan.api';
import { WorkPlanFormService } from '../work-plan-form.service';

@Component({
  selector: 'ems-work-plan-form-time',
  templateUrl: './work-plan-form-time.component.html',
  styleUrls: ['./work-plan-form-time.component.less'],
})
export class WorkPlanFormTimeComponent implements OnInit {
  public get isReadonly(): boolean {
    return this.service.isReadonly;
  }

  public get isInvalid(): boolean {
    return this.service.isInvalid;
  }
  // disabledDate = (current: Date): boolean => {
  //   return current.getTime() > new Date().getTime();
  // };
  public get item(): WP_IPlanInfo {
    return this.service.item;
  }

  public get periodOptions(): { label: string; value: WP_EExecutionPeriod }[] {
    return WP_EExecutionPeriod_Options;
  }

  public get holidayOptions(): { label: string; value: WP_ESkipHoliday }[] {
    if (!this.item.period) {
      return [];
    }

    if (
      [WP_EExecutionPeriod.每月, WP_EExecutionPeriod.特殊时间].includes(
        this.item.period
      )
    ) {
      return WP_ESkipHoliday_Options;
    }
    return WP_ESkipHoliday_Options.filter(
      ({ label, value }) => value === WP_ESkipHoliday.节假日跳过
    );
  }

  public get canShowDateRange(): boolean {
    if (!this.item.period) {
      return false;
    }

    if (WP_EExecutionPeriod.特殊时间 === this.item.period) {
      return false;
    }
    return true;
  }

  constructor(@SkipSelf() private service: WorkPlanFormService) {}

  ngOnInit(): void {}

  // 默认不勾选
  public onSelectPeriod(): void {
    if (
      [WP_EExecutionPeriod.每月, WP_EExecutionPeriod.特殊时间].includes(
        this.item.period
      )
    ) {
      this.item.holiday = WP_ESkipHoliday.节假日计划顺延至下一工作日;
    } else {
      this.item.holiday = WP_ESkipHoliday.节假日跳过;
    }
    // this.item.holiday = null;
    this.item.dateRange = null;
    this.item.details = [];
    this.service.doAddDetail();
  }
}
