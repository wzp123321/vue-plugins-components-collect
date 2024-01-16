import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MeasureLibraryCommunicationService } from '../services/measure-library-communication.service';
import { MeasureLibraryDatabaseService } from '../services/measure-library-database.service';

@Injectable()
export class MeasureLibraryToolbarService {
  public get isExporting(): boolean {
    return this.sDatabase.State_Toolbar_Exporting;
  }

  public get isImporting(): boolean {
    return this.sDatabase.State_Toolbar_Importing;
  }

  public get isDownloading(): boolean {
    return this.sDatabase.State_Toolbar_Downloading;
  }

  public get isSaving(): boolean {
    return this.sDatabase.State_Form_Saving;
  }

  constructor(
    private nzMessage: NzMessageService,
    private sCommunication: MeasureLibraryCommunicationService,
    private sDatabase: MeasureLibraryDatabaseService
  ) {}

  public doExport(): void {
    this.sCommunication.exportExcelEnergyManagerMeasure({
      name: this.sDatabase.Data_SearchBar.name,
      code: this.sDatabase.Data_SearchBar.code,
      system: this.sDatabase.Data_SearchBar.system,
      state: this.sDatabase.Data_SearchBar.state,
    });
  }

  public doImport(file: File): void {
    if (this.verify(file)) {
      this.sCommunication.uploadEnergyManagerMeasure(file);
    }
  }

  public doDownload(): void {
    this.sCommunication.downloadExcelEnergyManagerMeasureTemplate();
  }

  private verify(file: File): boolean {
    const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (types.includes(file?.type)) {
      return true;
    }

    this.nzMessage.error(`导入${file?.name ?? ''}失败，当前页面只支持导入.xls/.xlsx格式文件！`);
    return false;
  }
}
