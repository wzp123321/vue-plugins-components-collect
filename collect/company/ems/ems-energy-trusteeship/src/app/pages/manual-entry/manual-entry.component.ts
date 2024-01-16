import { Component, OnInit } from '@angular/core';
import { ManualEntryFormService } from './services/manual-entry-form.service';
import { ManualEntryTableDataService } from './services/manual-entry-table-data.service';
import { ManualEntryToolbarService } from './services/manual-entry-toolbar.service';
import { ManualEntryService } from './services/manual-entry.service';

@Component({
  selector: 'app-manual-entry',
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.less'],
  providers: [ManualEntryService, ManualEntryToolbarService, ManualEntryFormService, ManualEntryTableDataService],
})
export class ManualEntryComponent implements OnInit {
  // 是否可以点击批量导出了
  public get isExporting(): boolean {
    return this.meToolbarService.getIsExporting;
  }
  // 是否可以点击下载模板了
  public get isDownloading(): boolean {
    return this.meToolbarService.getIsDownloading;
  }
  constructor(private meToolbarService: ManualEntryToolbarService) {}

  ngOnInit(): void {}
}
