import { Component, OnInit, SkipSelf, ViewChild } from '@angular/core';
import { NzTimePickerComponent } from 'ng-zorro-antd/time-picker';
import {
  ML_EMeasureSystem,
  ML_EMeasureSystem_Options,
} from 'src/app/pages/measure-library/measure-library.api';
import {
  WP_EExecutionPeriod,
  WP_EExecutionType,
  WP_EExecutionType_Options,
  WP_EWeek,
  WP_EWeek_Options,
  WP_IPlanDetail,
  WP_IPlanInfo,
  WP_IPlanTime,
  WP_IPlanTime_Month,
  WP_IPlanTime_Special,
} from '../../work-plan.api';
import { WorkPlanFormService } from '../work-plan-form.service';

@Component({
  selector: 'ems-work-plan-form-detail',
  templateUrl: './work-plan-form-detail.component.html',
  styleUrls: ['./work-plan-form-detail.component.less'],
})
export class WorkPlanFormDetailComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isReadonly(): boolean {
    return this.service.isReadonly;
  }
  public get showSearch(): boolean {
    return this.service.showSearch;
  }

  public get isInvalid(): boolean {
    return this.service.isInvalid;
  }

  public get item(): WP_IPlanInfo {
    return this.service.item;
  }

  public get systemOptions(): { label: string; value: ML_EMeasureSystem }[] {
    return ML_EMeasureSystem_Options;
  }

  public get workdayOptions(): { label: string; value: WP_EWeek }[] {
    return WP_EWeek_Options.filter(
      ({ label, value }) => ![WP_EWeek.周六, WP_EWeek.周日].includes(value)
    );
  }
  public get weekendOptions(): { label: string; value: WP_EWeek }[] {
    return WP_EWeek_Options.filter(({ label, value }) =>
      [WP_EWeek.周六, WP_EWeek.周日].includes(value)
    );
  }

  public get typeOptions(): { label: string; value: WP_EExecutionType }[] {
    return WP_EExecutionType_Options;
  }

  public get canShowDelete(): boolean {
    return this.item.details?.length > 1;
  }

  public get canShowDayTimesheet(): boolean {
    return [
      WP_EExecutionPeriod.每日,
      WP_EExecutionPeriod['工作日（周一至周五）'],
    ].includes(this.item.period);
  }
  public get canShowWeekTimesheet(): boolean {
    return WP_EExecutionPeriod.每周 === this.item.period;
  }
  public get canShowMonthTimesheet(): boolean {
    return WP_EExecutionPeriod.每月 === this.item.period;
  }
  public get canShowSpecialTimesheet(): boolean {
    return WP_EExecutionPeriod.特殊时间 === this.item.period;
  }

  constructor(@SkipSelf() private service: WorkPlanFormService) {}

  ngOnInit(): void {}

  public onSelectSystem(detail: WP_IPlanDetail): void {
    detail.measure = null;
    //全部时，不能输入
    if (detail.system === 0) {
      detail.showSearch = false;
    } else {
      detail.showSearch = true;
    }
    this.service.doGetMeasureOptions(detail);
  }

  public onSelectMeasure(detail: WP_IPlanDetail): void {
    detail.description =
      detail.measureOptions?.find((option) => option.value === detail.measure)
        ?.description ?? null;
    detail.measureName =
      detail.measureOptions?.find((option) => option.value === detail.measure)
        ?.label ?? '';
    detail.newFlag =
      detail.measureOptions?.find((option) => option.value === detail.measure)
        ?.newFlag ?? false;
  }

  public onCheckTimeBegin(
    element: NzTimePickerComponent,
    detail: WP_IPlanDetail
  ): void {
    if (element?.inputValue) {
      detail.timesheet[0].begin = new Date(
        `${new Date().toLocaleDateString()} ${element.inputValue}`
      );
    }
  }

  public onCheckTimeEnd(
    element: NzTimePickerComponent,
    detail: WP_IPlanDetail
  ): void {
    if (element?.inputValue) {
      detail.timesheet[0].end = new Date(
        `${new Date().toLocaleDateString()} ${element.inputValue}`
      );
    }
  }

  public onSelectWeekDay(detail: WP_IPlanDetail, days: WP_EWeek[]): void {
    detail.timesheet[0].execution = days;
  }

  public onSelectTimeType(detail: WP_IPlanDetail): void {
    const time = detail.timesheet.shift();
    detail.timesheet = [
      { id: time.id, begin: null, end: null, type: time.type },
    ];
  }

  public onCheckSingleDay(state: boolean, time: WP_IPlanTime_Month): void {
    if (state) {
      time.end = time.begin;
    } else {
      time.begin = null;
      time.end = null;
    }
  }

  public onCheckSingleDayRepeat(detail: WP_IPlanDetail, index: number): void {
    const days = detail.timesheet.map((time, i) => {
      if (i === index) {
        return null;
      }
      return time.begin as string;
    });
    if (days.includes(detail.timesheet[index].begin as string)) {
      detail.timesheet[index].begin = null;
      detail.timesheet[index].end = null;
    }
  }

  public onCheckDayBegin(state: boolean, time: WP_IPlanTime): void {
    if (!state) {
      time.begin = null;
    }
  }

  public onCheckDayEnd(state: boolean, time: WP_IPlanTime): void {
    if (!state) {
      time.end = null;
    }
  }

  public toAddSingleDay(detail: WP_IPlanDetail): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (detail.timesheet.length < 31) {
      detail.timesheet.push({
        id: null,
        begin: null,
        end: null,
        type: WP_EExecutionType.每日执行,
      });
    }
  }

  public toDeleteSingleDay(detail: WP_IPlanDetail, index: number): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (index && detail.timesheet?.length > 1) {
      detail.timesheet.splice(index, 1);
    }
  }

  public toAddSpecialDate(detail: WP_IPlanDetail): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (detail.timesheet[0].execution.length < 50) {
      (detail.timesheet[0] as WP_IPlanTime_Special).execution.push({
        date: null,
      });
    }
  }

  public toDeleteSpecialDate(detail: WP_IPlanDetail, index: number): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (index && detail.timesheet[0]?.execution?.length > 1) {
      detail.timesheet[0].execution.splice(index, 1);
    }
  }

  public toAddDetail(): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (this.item.period) {
      this.service.doAddDetail();
    }
  }

  public toDeleteDetail(index: number): void {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (this.canShowDelete) {
      this.service.doDeleteDetail(index);
    }
  }

  public mapHoursBeforeTime(time: Date | string): () => number[] {
    return () => {
      if (time && time instanceof Date) {
        return [...new Array(time.getHours()).keys()];
      }
      return [];
    };
  }

  public mapHoursAfterTime(time: Date | string): () => number[] {
    return () => {
      if (time && time instanceof Date) {
        return Array.from({ length: 23 - time.getHours() }, (v, k) => 23 - k);
      }
      return [];
    };
  }

  public mapMinutesBeforeTime(time: Date | string): (hour: number) => number[] {
    return (hour) => {
      if ([...new Array(24).keys()].includes(hour)) {
        if (time && time instanceof Date && time.getHours() === hour) {
          return [...new Array(time.getMinutes()).keys()];
        }
        return [];
      }
      return [...new Array(60).keys()];
    };
  }

  public mapMinutesAfterTime(time: Date | string): (hour: number) => number[] {
    return (hour) => {
      if ([...new Array(24).keys()].includes(hour)) {
        if (time && time instanceof Date && time.getHours() === hour) {
          return Array.from(
            { length: 59 - time.getMinutes() },
            (v, k) => 59 - k
          );
        }
        return [];
      }
      return [...new Array(60).keys()];
    };
  }

  public mapWeekDayCheckState(
    execution: WP_EWeek[] | { date: Date }[],
    value: WP_EWeek
  ): boolean {
    return (execution as WP_EWeek[])?.includes(value);
  }

  public mapSingleInputVisibility(type: WP_EExecutionType): boolean {
    return type === WP_EExecutionType.每日执行;
  }

  public mapRangeInputVisibility(type: WP_EExecutionType): boolean {
    return type === WP_EExecutionType.持续执行;
  }

  public mapRepeatSpecialDate(
    execution: WP_EWeek[] | { date: Date }[],
    index: number
  ): (current: Date) => boolean {
    return (current) => {
      if (
        (execution as { date: Date }[])
          .map((v, i) => {
            if (i === index) {
              return null;
            }
            return v.date?.toLocaleDateString();
          })
          .includes(current.toLocaleDateString())
      ) {
        return true;
      }
      return false;
    };
  }

  public mapDescriptionCount(description: string): string {
    return `${description?.length ?? 0}/2000`;
  }

  public assertTimesheetAsMonth(
    timesheet: WP_IPlanTime[]
  ): WP_IPlanTime_Month[] {
    return timesheet as WP_IPlanTime_Month[];
  }

  public assertTimesheetAsSpecial(
    timesheet: WP_IPlanTime[]
  ): WP_IPlanTime_Special[] {
    if (!timesheet[0]?.execution?.length) {
      (timesheet[0] as WP_IPlanTime_Special).execution.push({ date: null });
    }

    return timesheet as WP_IPlanTime_Special[];
  }

  public autoScroll(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.scrollTop = element.scrollHeight;
  }

  public setItem(value: string, index: number) {
    if (!!value) {
      if (!this.item.details[index].measureOptions) {
        this.item.details[index].measureOptions = [];
      }

      if (this.item.details[index].measureOptions?.find((v) => v.value === 0)) {
        this.item.details[index].measureOptions?.pop();
      }
      this.item.details[index].measureOptions?.push({
        description: null,
        label: value,
        value: 0,
        newFlag: true,
      });
      this.item.details[index].measure = 0;
      this.item.details[index].measureName = value;
      this.item.details[index].newFlag = true;
    }
  }
}
