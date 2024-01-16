import { Component, OnInit, Self } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FUploadHandler } from 'src/app/common/services/communication/communication.api';
import { MeasureLibraryFormComponent } from '../measure-library-form/measure-library-form.component';
import { MeasureLibraryToolbarService } from './measure-library-toolbar.service';

@Component({
  selector: 'ems-measure-library-toolbar',
  templateUrl: './measure-library-toolbar.component.html',
  styleUrls: ['./measure-library-toolbar.component.less'],
  providers: [MeasureLibraryToolbarService],
})
export class MeasureLibraryToolbarComponent implements OnInit {
  public get isExporting(): boolean {
    return this.service.isExporting;
  }

  public get isImporting(): boolean {
    return this.service.isImporting;
  }

  public get isDownloading(): boolean {
    return this.service.isDownloading;
  }

  public get isSaving(): boolean {
    return this.service.isSaving;
  }

  constructor(private nzModal: NzModalService, @Self() private service: MeasureLibraryToolbarService) {}

  ngOnInit(): void {}

  public toExport(): void {
    if (this.isExporting) {
      return;
    }

    this.service.doExport();
  }

  public async toImport(): Promise<void> {
    if (this.isImporting) {
      return;
    }

    try {
      const file = await FUploadHandler('.xls,.xlsx');
      this.service.doImport(file);
    } catch (error) {
      console.warn(error);
    }
  }

  public toDownload(): void {
    if (this.isDownloading) {
      return;
    }

    this.service.doDownload();
  }

  public presentNewMeasureModal(): void {
    const modal: MeasureLibraryFormComponent = this.nzModal.create({
      nzWidth: 452,
      nzCentered: true,
      nzTitle: '新增措施',
      nzContent: MeasureLibraryFormComponent,
      nzCancelDisabled: this.isSaving,
      nzOkText: '保存',
      nzOkLoading: this.isSaving,
      nzOnCancel: () => {
        return !this.isSaving;
      },
      nzOnOk: async () => {
        if (this.isSaving) {
          return false;
        }

        return await modal.toCreate();
      },
    }).componentInstance;
  }
}
