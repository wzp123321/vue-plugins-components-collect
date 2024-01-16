import { Component, OnInit, Self } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { MeasureLibraryFormComponent } from '../measure-library-form/measure-library-form.component';
import {
  ML_EExecutionPeriod,
  ML_EMeasureOrigin,
  ML_EMeasureState,
  ML_EMeasureSystem,
  ML_ERelatedFunction,
  ML_IMeasureItem,
} from '../measure-library.api';
import { MeasureLibraryTableService } from './measure-library-table.service';

@Component({
  selector: 'ems-measure-library-table',
  templateUrl: './measure-library-table.component.html',
  styleUrls: ['./measure-library-table.component.less'],
  providers: [MeasureLibraryTableService],
  viewProviders: [{ provide: PaginationService, useExisting: MeasureLibraryTableService }],
})
export class MeasureLibraryTableComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public set index(v: number) {
    this.service.index = v;
  }
  public get index(): number {
    return this.service.index;
  }

  public set size(v: number) {
    this.service.size = v;
  }
  public get size(): number {
    return this.service.size;
  }

  public get total(): number {
    return this.service.total;
  }

  public get list(): ML_IMeasureItem[] {
    return this.service.list;
  }

  constructor(private nzModal: NzModalService, @Self() private service: MeasureLibraryTableService) {}

  ngOnInit(): void {}

  public toDelete(item: ML_IMeasureItem): void {
    if (this.isLoading) {
      return;
    }

    if (item.canDelete) {
      this.service.doDelete(item.id);
    }
  }

  public presentMeasureModal(item: ML_IMeasureItem): void {
    this.nzModal.create({
      nzWidth: 452,
      nzCentered: true,
      nzTitle: '措施详情',
      nzContent: MeasureLibraryFormComponent,
      nzComponentParams: { item: { ...item }, isReadonly: true },
      nzFooter: null,
    }).componentInstance;
  }

  public presentUpdateMeasureModal(item: ML_IMeasureItem): void {
    const modal: MeasureLibraryFormComponent = this.nzModal.create({
      nzWidth: 452,
      nzCentered: true,
      nzTitle: '编辑措施',
      nzContent: MeasureLibraryFormComponent,
      nzComponentParams: { item: { ...item } },
      nzCancelDisabled: this.isLoading,
      nzOkText: '保存',
      nzOkLoading: this.isLoading,
      nzOnCancel: () => {
        return !this.isLoading;
      },
      nzOnOk: async () => {
        if (this.isLoading) {
          return false;
        }

        return await modal.toUpdate();
      },
    }).componentInstance;
  }

  public mapSystem(v: ML_EMeasureSystem): string {
    return ML_EMeasureSystem[v];
  }

  public mapPeriod(v: ML_EExecutionPeriod): string {
    return ML_EExecutionPeriod[v];
  }

  public mapState(v: ML_EMeasureState): string {
    return ML_EMeasureState[v];
  }

  public mapRelation(v: ML_ERelatedFunction): string {
    return ML_ERelatedFunction[v];
  }

  public mapOrigin(v: ML_EMeasureOrigin): string {
    return ML_EMeasureOrigin[v];
  }
}
