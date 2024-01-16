import { Component, OnInit, Self } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EnergyEventFormComponent } from './energy-event-form/energy-event-form.component';
import { EnergyEventService } from './energy-event.service';

@Component({
  selector: 'ems-energy-event',
  templateUrl: './energy-event.component.html',
  styleUrls: ['./energy-event.component.less'],
  providers: [EnergyEventService],
})
export class EnergyEventComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isSaving(): boolean {
    return this.service.isSaving;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  constructor(
    private nzModal: NzModalService,
    @Self() private service: EnergyEventService
  ) {}

  ngOnInit(): void {
    // 接收跳转传参
    if (this.getSessionAnomalyId()) {
      this.presentNewEventModal();
      window.sessionStorage.removeItem('ems-anomaly-event-params');
    }
  }

  public getSessionAnomalyId(): string {
    const params = window.sessionStorage.getItem('ems-anomaly-event-params');
    let boundaryId = '';
    if (params) {
      const parseParams = JSON.parse(params);
      boundaryId = parseParams?.boundaryId ?? '';
    }
    return boundaryId;
  }

  public presentNewEventModal(): void {
    const modal: EnergyEventFormComponent = this.nzModal.create({
      nzWidth: 560,
      nzCentered: true,
      nzTitle: '新增事件',
      nzContent: EnergyEventFormComponent,
      nzCancelDisabled: this.isSaving,
      nzComponentParams: { boundaryId: this.getSessionAnomalyId() },
      nzOkLoading: this.isSaving,
      nzOnCancel: () => {
        !this.isSaving;
        window.sessionStorage.removeItem('ems-anomaly-event-params');
      },
      nzOnOk: async () => {
        if (this.isSaving) {
          return false;
        }

        return await modal.toUpdate();
      },
    }).componentInstance;
  }
}
