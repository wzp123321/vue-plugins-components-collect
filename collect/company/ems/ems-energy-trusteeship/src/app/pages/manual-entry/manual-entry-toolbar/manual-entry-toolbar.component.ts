import { Component, OnInit } from '@angular/core';
import { ManualEntryService } from '../services/manual-entry.service';
import { verificationParamType } from '../manual-entry.api';
import { ManualEntryToolbarService } from '../services/manual-entry-toolbar.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ManualEntryObjectService } from '../services/manual-entry-object.service';

@Component({
  selector: 'app-manual-entry-toolbar',
  templateUrl: './manual-entry-toolbar.component.html',
  styleUrls: ['./manual-entry-toolbar.component.less'],
})
export class ManualEntryToolbarComponent implements OnInit {
  toolbarParam: verificationParamType;
  batchImportShow: boolean = false;

  // 是否可以点击批量导出了
  public get isExporting(): boolean {
    return this.meToolbarService.getIsExporting;
  }
  // 是否可以点击下载模板了
  public get isDownloading(): boolean {
    return this.meToolbarService.getIsDownloading;
  }

  // 录入
  showEntryModal: boolean = false;

  constructor(
    private meService: ManualEntryService,
    private meToolbarService: ManualEntryToolbarService,
    private nzMessage: NzMessageService
  ) {
    // 查询的参数
    this.meService.getSearchParamList.subscribe((param) => {
      this.toolbarParam = param;
    });
  }

  // 批量导入
  fileList: any[] = [];
  fileType: File[] = [];
  fileErrorList: any[] = [];
  acceptFileTypes = '.xlsm';
  nzFileType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
  private readonly ACCEPT_FILE_TYPES = ['application/vnd.ms-excel.sheet.macroEnabled.12'];
  // 10mb
  private readonly MAX_FILE_SIZE = 10485760;

  // 导入失败错误信息
  public get errorListModelShow() {
    return this.meToolbarService.getErrorListModelShow;
  }
  ngOnInit(): void {}
  /**
   * 批量导出
   */
  toExport() {
    if (this.isExporting) {
      return;
    }
    // console.log('toolbarParam', this.toolbarParam);
    this.meToolbarService.doExport(this.toolbarParam);
  }

  /**
   * 批量导入
   * @param item
   */
  toImport() {
    this.batchImportShow = true;
    this.meToolbarService.getIsImportColse(true);
  }
  /**
   * 批量导入
   * @param item
   */
  beforeUpload = (file: any): boolean => {
    const types = ['application/vnd.ms-excel.sheet.macroEnabled.12'];

    if (!types.includes(file?.type)) {
      const errorMsg = `文件${file.name}类型不允许, 只支持xlsm类型文件！`;
      this.nzMessage.error(`导入${file?.name ?? ''}失败，当前页面只支持导入.xlsm格式文件！`);
      return false;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      const errorMsg = `文件${file.name}大小不能超过10mb!`;
      this.nzMessage.error(errorMsg);
      return false;
    }
    this.fileType.push(file);
    this.fileList = this.fileList.concat(file);
    this.meToolbarService.doImport([file]);
    return false;
  };
  /**
   * 批量导入错误列表弹窗
   * @param item
   */
  handleHideErrorModal(item: boolean) {
    this.meToolbarService.setErrorListModelShow = item;
  }

  importHideModal(item: boolean) {
    this.batchImportShow = item;
  }
  /**
   * 下载模板
   */
  toDownload() {
    if (this.isDownloading) {
      return;
    }
    this.meToolbarService.doDownload();
  }
  /**
   * 新增数据录入
   */
  newAddInput() {
    this.showEntryModal = true;
    this.meToolbarService.modalShowDate(true);
  }
  /**
   * 关闭数据录入
   * @param item
   */
  handleHideModal(item: boolean) {
    this.showEntryModal = item;
    this.meToolbarService.modalShowDate(false);
  }
}
