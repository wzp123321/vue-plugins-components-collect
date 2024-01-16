import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ManualEntryToolbarService } from '../services/manual-entry-toolbar.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { erorrListDeils } from '../manual-entry.api';

@Component({
  selector: 'app-manual-entry-batch-import',
  templateUrl: './manual-entry-batch-import.component.html',
  styleUrls: ['./manual-entry-batch-import.component.less'],
})
export class ManualEntryBatchImportComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() meOnHideModal = new EventEmitter<boolean>();

  uploading: boolean;
  fileList: any[] = [];
  fileType: File[] = [];
  fileErrorList: any[] = [];
  acceptFileTypes = '.xls';
  private readonly ACCEPT_FILE_TYPES = ['application/vnd.ms-excel.sheet.macroEnabled.12'];
  // 10mb
  private readonly MAX_FILE_SIZE = 10485760;

  // 是否打开错误列表
  public get errorListModelShow() {
    return this.meToolbarService.getErrorListModelShow;
  }
  public get isLoading() {
    return this.meToolbarService.getIsLoading;
  }
  showErroModal: boolean = false;
  // 是否可以点击导入
  public get isImporting() {
    return this.meToolbarService.getIsImporting;
  }

  // 列表错误
  public get importResult() {
    return this.meToolbarService.getImportResult;
  }

  // 列表是否打开
  showErrodetailsModal: boolean = false;
  constructor(private meToolbarService: ManualEntryToolbarService, private nzMessage: NzMessageService) {
    // 导入成功与否关闭弹窗

    this.meToolbarService.getIsImportColseType.subscribe((data) => {
      this.isVisible = data;
      this.fileList = [];
      this.fileType = [];
    });
  }

  ngOnInit(): void {}
  beforeUpload = (file: any): boolean => {
    console.log(file);
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
    return false;
  };
  /**
   * 取消
   */
  handleCancel() {
    this.fileList = [];
    this.fileType = [];
    this.meOnHideModal.emit(false);
  }
  /**
   * 移除文件
   * @param item
   */
  fileRemove(item: any) {
    const list = this.fileList.filter((data) => data !== item);
    this.fileList = list;
    const listFlileType = this.fileType.filter((data) => data !== item);
    this.fileType = listFlileType;
  }
  /**
   * 导入
   * @returns
   */
  handleUpload() {
    if (this.isImporting) {
      return;
    }
    if (this.fileList && this.fileList.length === 0) {
      this.nzMessage.error('请导入文件！');
      return;
    }
    this.meToolbarService.doImport(this.fileType);
  }

  /**
   * 关闭错误列表弹窗
   */
  handleCancelErrorList() {
    this.meToolbarService.setErrorListModelShow = false;
  }
  /**
   * 打开错误详情弹窗
   * @param item
   */
  errorResult(item: erorrListDeils[]) {
    this.showErrodetailsModal = true;
    this.meToolbarService.setErrorDertailsList(item);
  }
  handleHideErrorModal(item: boolean) {
    this.showErrodetailsModal = item;
  }
}
