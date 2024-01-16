import { Injectable, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { WorkPlanCommunicationService } from '../services/work-plan-communication.service';
import { WorkPlanDatabaseService } from '../services/work-plan-database.service';
import {
  WP_EExecutionPeriod,
  WP_EExecutionType,
  WP_IPlanDetail,
  WP_IPlanInfo,
} from '../work-plan.api';

@Injectable()
export class WorkPlanFormService implements OnDestroy {
  private _item: WP_IPlanInfo = {
    id: null,
    name: null,
    code: null,
    description: null,
    period: null,
    state: null,
    holiday: null,
    dateRange: null,
    details: [],
  };
  public get item(): WP_IPlanInfo {
    return this._item;
  }

  private _title = '';
  public set title(value) {
    this._title = value;
  }
  public get title() {
    return this._title;
  }

  public get isLoading(): boolean {
    return (
      this.sDatabase.State_Form_Searching || this.sDatabase.State_Form_Saving
    );
  }

  private _Readonly = false;
  public set isReadonly(v: boolean) {
    this._Readonly = v;
  }
  public get isReadonly(): boolean {
    return this._Readonly;
  }
  private _showSearch = true;
  public set showSearch(v: boolean) {
    this._showSearch = v;
  }
  public get showSearch(): boolean {
    return this._showSearch;
  }

  private _Invalid = false;
  public get isInvalid(): boolean {
    return this._Invalid;
  }

  private _subscriptions: Subscription[] = [];

  constructor(
    private nzMessage: NzMessageService,
    private sCommunication: WorkPlanCommunicationService,
    private sDatabase: WorkPlanDatabaseService
  ) {
    this._subscriptions.push(
      this.sDatabase.Event_Form_DataLoad.subscribe((v) => {
        v?.id && (this._item = v);
        this.item.details.forEach((detail) => this.doGetMeasureOptions(detail));
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public doGetMeasureOptions(detail: WP_IPlanDetail): void {
    //全部时，不能输入
    if (detail.system === 0) {
      detail.showSearch = false;
    } else {
      detail.showSearch = true;
    }
    this.sCommunication.queryMeasureList(detail, this.item.period, this._title);
  }

  public doAddDetail(): void {
    this._Invalid = false;

    this.item.details.push({
      id: null,
      system: null,
      measure: null,
      measureName: '',
      description: null,
      timesheet: [
        {
          id: null,
          begin: null,
          end: null,
          execution: [],
          type:
            WP_EExecutionPeriod.每月 === this.item.period
              ? WP_EExecutionType.每日执行
              : null,
        },
      ],
    });
  }

  public doDeleteDetail(index: number): void {
    this.item.details.splice(index, 1);
  }

  public async doCreate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.verify()) {
        const subscription = this.sDatabase.Event_Form_DataChange.subscribe(
          ({ success }) => {
            subscription.unsubscribe();
            resolve(success);
          }
        );
        this.sCommunication.addWorkPlan(this.item);
      } else {
        resolve(false);
      }
    });
  }

  public doRetrieve(id: number): void {
    this.sCommunication.queryWorkPlanInfo(id);
  }

  public async doUpdate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.verify()) {
        const subscription = this.sDatabase.Event_Form_DataChange.subscribe(
          ({ success }) => {
            subscription.unsubscribe();
            resolve(success);
          }
        );
        this.sCommunication.editWorkPlanInfo(this.item);
      } else {
        resolve(false);
      }
    });
  }

  private verify(): boolean {
    this._Invalid = false;
    const messages: string[] = [];
    if (!this.item.name) {
      messages.push('计划名称不能为空');
    }
    if (!this.item.period) {
      messages.push('执行周期不能为空');
    }
    if (
      [
        WP_EExecutionPeriod.每日,
        WP_EExecutionPeriod['工作日（周一至周五）'],
        WP_EExecutionPeriod.每周,
        WP_EExecutionPeriod.每月,
      ].includes(this.item.period) &&
      !this.item.dateRange?.length
    ) {
      messages.push('生效时间不能为空');
    }
    if (!this.item.details.length) {
      messages.push('请添加计划细则');
    } else {
      this.item.details.forEach((detail) => {
        if (detail.system === null) {
          messages.push('所属系统不能为空');
        }
        if (detail.measure === null) {
          messages.push('执行措施不能为空');
        }
        detail.timesheet.forEach((time) => {
          if (
            [
              WP_EExecutionPeriod.每日,
              WP_EExecutionPeriod['工作日（周一至周五）'],
              WP_EExecutionPeriod.每月,
            ].includes(this.item.period) &&
            (!time.begin || !time.end)
          ) {
            messages.push('执行时间不能为空');
          }
          if (
            WP_EExecutionPeriod.每周 === this.item.period &&
            !time.execution?.length
          ) {
            messages.push('执行时间不能为空');
          }
          if (WP_EExecutionPeriod.特殊时间 === this.item.period) {
            if (!time.execution?.length) {
              messages.push('执行时间不能为空');
            } else {
              (time.execution as { date: Date }[]).forEach((day) => {
                if (!day?.date) {
                  messages.push('执行时间不能为空');
                }
              });
            }
          }
        });
      });
    }

    if (messages.length > 1) {
      messages.unshift('请填写必填项');
    }

    if (messages.length) {
      this.nzMessage.error(messages.shift());
      this._Invalid = true;
    }

    return !this._Invalid;
  }
}
