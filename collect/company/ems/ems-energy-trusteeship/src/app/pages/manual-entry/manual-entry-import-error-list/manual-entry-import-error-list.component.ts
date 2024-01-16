import { Component, EventEmitter, Input, OnInit, Output, Self } from '@angular/core';
import { ManualEntryToolbarService } from '../services/manual-entry-toolbar.service';
import { erorrListDeils } from '../manual-entry.api';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { ManualEntryTableService } from '../services/manual-entry-table.service';

@Component({
  selector: 'app-manual-entry-import-error-list',
  templateUrl: './manual-entry-import-error-list.component.html',
  styleUrls: ['./manual-entry-import-error-list.component.less'],
  providers: [ManualEntryTableService],
  viewProviders: [{ provide: PaginationService, useExisting: ManualEntryTableService }],
})
export class ManualEntryImportErrorListComponent implements OnInit {
  @Input() errorModalVisible: boolean;
  @Output() meOnHideModal = new EventEmitter<boolean>();

  errorDetailsList: erorrListDeils[] = [];
  // 列表错误
  public get importResult(): erorrListDeils[] {
    return this.meToolbarService.getImportUploadResult;
  }
  public set errorPageIndex(v: number) {
    this.meTableService.index = v;
  }
  public get errorPageIndex(): number {
    return this.meTableService.index;
  }

  public set errorPageSize(v: number) {
    this.meTableService.size = v;
  }
  public get errorPageSize(): number {
    return this.meTableService.size;
  }

  public get totalError(): number {
    return this.meTableService.total;
  }

  constructor(
    private meToolbarService: ManualEntryToolbarService,
    private pService: PaginationService,
    @Self() private meTableService: ManualEntryTableService
  ) {
    // 拿到错误列表详情信息
    this.meToolbarService.getErrorDertailsList.subscribe((data) => {
      this.errorDetailsList = data || [];
      this.errorPageIndex = 1;

      //    this.pService.total = this.errorDetailsList.length;
      this.errorPageSize = 10;
      // this.totalError = this.errorDetailsList.length;
      this.meToolbarService.total = 20;
      // this.meToolbarService.setTo
    });
  }

  ngOnInit(): void {}
  handleErrorModalCancel() {
    this.errorModalVisible = false;
    this.meOnHideModal.emit(false);
  }
}
