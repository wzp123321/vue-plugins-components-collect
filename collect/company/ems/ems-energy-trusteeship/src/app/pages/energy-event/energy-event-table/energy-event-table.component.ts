import { Component, OnInit, Self } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { EnergyEventDetailComponent } from '../energy-event-detail/energy-event-detail.component';
import { EnergyEventFormComponent } from '../energy-event-form/energy-event-form.component';
import { EE_EEventType, EE_IEventItem } from '../energy-event.api';
import { EnergyEventTableService } from './energy-event-table.service';

@Component({
  selector: 'ems-energy-event-table',
  templateUrl: './energy-event-table.component.html',
  styleUrls: ['./energy-event-table.component.less'],
  providers: [EnergyEventTableService],
  viewProviders: [{ provide: PaginationService, useExisting: EnergyEventTableService }],
})
export class EnergyEventTableComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isSaving(): boolean {
    return this.service.isSaving;
  }

  public get isExporting(): boolean {
    return this.service.isExporting;
  }

  public get unit(): string {
    return this.service.unit;
  }

  public get type(): EE_EEventType {
    return this.service.type;
  }

  public get list(): EE_IEventItem[] {
    return this.service.list;
  }

  public get isAirConditioner(): boolean {
    return EE_EEventType.空调供应时段调整 === this.type;
  }

  public get canShowOperateColumn(): boolean {
    return EE_EEventType.能源单价调整 !== this.type;
  }

  constructor(private nzModal: NzModalService, @Self() private service: EnergyEventTableService) {}

  ngOnInit(): void {}

  public toExport(): void {
    if (this.type || this.isExporting) {
      return;
    }

    this.service.doExport();
  }

  public toDelete(id: number): void {
    if (this.isLoading) {
      return;
    }

    this.service.doDelete(id);
  }

  public presentEditEventModal(id: number): void {
    const modal: EnergyEventFormComponent = this.nzModal.create({
      nzWidth: 560,
      nzCentered: true,
      nzTitle: '修改事件',
      nzContent: EnergyEventFormComponent,
      nzComponentParams: { id },
      nzCancelDisabled: this.isSaving,
      nzOkLoading: this.isSaving,
      nzOnCancel: () => !this.isSaving,
      nzOnOk: async () => {
        if (this.isSaving) {
          return false;
        }

        return await modal.toUpdate();
      },
    }).componentInstance;
  }

  public presentDetailModal(id: number): void {
    this.nzModal.create({
      nzWidth: 1000,
      nzCentered: true,
      nzTitle: '详情',
      nzContent: EnergyEventDetailComponent,
      nzComponentParams: { id },
      nzFooter: null,
    }).componentInstance;
  }

  public mapEventType(type: EE_EEventType): string {
    return EE_EEventType[type];
  }

  public mapOperateButtonVisibility(type: EE_EEventType): boolean {
    return [
      EE_EEventType.用能区域变化,
      EE_EEventType.大功率用能设备变更,
      EE_EEventType.区域业务调整,
      EE_EEventType.空调供应时段调整,
      EE_EEventType.其他调整,
    ].includes(type);
  }

  public mapDetailButtonVisibility(type: EE_EEventType): boolean {
    return type !== EE_EEventType.能源单价调整;
  }
}
