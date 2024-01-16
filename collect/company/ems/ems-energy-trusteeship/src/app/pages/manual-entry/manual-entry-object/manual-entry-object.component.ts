import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { treeType, deviceDataList } from '../manual-entry.api';
import { ManualEntryObjectService } from '../services/manual-entry-object.service';
import { ManualEntryService } from '../services/manual-entry.service';
import * as lodash from 'lodash';
import { ManualEntryToolbarService } from '../services/manual-entry-toolbar.service';
import { ManualEntryFormService } from '../services/manual-entry-form.service';

@Component({
  selector: 'app-manual-entry-object',
  templateUrl: './manual-entry-object.component.html',
  styleUrls: ['./manual-entry-object.component.less'],
})
export class ManualEntryObjectComponent implements OnInit, OnChanges {
  // 内置文案
  @Input() placeholder = '请选择';
  @Input() objectPosition: string = 'fixed';
  // 录入对象
  public get radioData() {
    return this.meObjectService.treeClassId;
  }
  // 树组件宽度
  @Input() width = 358;
  @Input() treeTitle = '';
  treeTip: string =
    this.radioData.selectValue === 1
      ? '区域'
      : this.radioData.selectValue === 2
      ? '业态'
      : this.radioData.selectValue === 3
      ? '支路'
      : '';
  @Output() meoTreeSelectRadioChange = new EventEmitter();
  @Output() meoTreeSelectChange = new EventEmitter();
  @Output() meoTDeviceSelectChange = new EventEmitter();
  @Output() meoTSubmitSelectChange = new EventEmitter();
  @Output() meoDataReload = new EventEmitter();

  // 树数据
  treeSelectNodes: any = [];
  // public get treeSelectNodes(): any {
  //   return this.meObjectService.getTypeTreeList ?? [];
  // }
  // 树数据默认展开节点
  treeSelectExpandedKeys: any = [];
  // public get treeSelectExpandedKeys() {
  //   return this.meObjectService.typeExpandKeyData  ?? [];
  // }
  // 选中节点数据
  select: string[] = [];
  // 选中树名称
  selectName: string = null;
  // 选中节点的name集合
  name: any = null;
  // 下拉面板显示/隐藏
  isPanelShow: boolean = false;
  // 树的查询框数据
  searchValue: string = '';
  public get loading() {
    return this.meObjectService.getLoading;
  }
  // 设备数据
  // deviceData: any = [];
  public get deviceData() {
    return this.meObjectService.getDeviceData;
  }
  // 设备查询框
  searchDeviceValue: string = '';
  // 设备选中
  deviceSelect: any = null;
  // 设备选中名称
  deviceSelectName: any = null;
  // 选中设备点位
  pointNumber: number = null;
  // 选中设备点位名称
  pointName: string = '';
  standardPointCode: string = '';
  // deviceLoading = false;
  public get deviceLoading(): boolean {
    return this.meObjectService.getDeviceLoading;
  }
  // deviceNodataMsg = '请先选择' + this.treeTip + '节点';
  public get deviceNodataMsg() {
    return this.meObjectService.getDeviceNodataMsg;
  }
  submitSelect: any = [];
  submitDeviceSelect: any = null;
  submitDeviceData: any = [];

  submitDataList: any;
  // 选中的是树还是设备
  objectIdType: string;
  // 分类分项
  public get energyCode() {
    return this.meService.getEnergyCode;
  }
  enetryCodeItem: string = '';

  // modal里的遮罩层
  modalMask: string = '100vh';
  modalTop: string = '0';

  moladShow: boolean = false;
  constructor(
    private elementRef: ElementRef,
    private meService: ManualEntryService,
    private meObjectService: ManualEntryObjectService,
    private nzMessage: NzMessageService,
    private meToolbarService: ManualEntryToolbarService,
    private meFormService: ManualEntryFormService
  ) {
    // 树接口
    this.meService.entryCodeItem.subscribe((data) => {
      this.enetryCodeItem = data.code;
      // 清空
      // this.radioData.selectValue = 1;
      this.select = [];
      this.selectName = null;
      this.deviceSelect = null;
      this.deviceSelectName = null;
      this.pointName = '';
      this.name = null;
      this.submitSelect = [];
      this.submitDeviceSelect = null;
      // 选中的节点;
      this.submitDataList = {
        objectId: null,
        deviceId: null,
        pointNumber: null,
        standardPointCode: '',
        objectType: null,
        submit: false,
        objectName: '',
      };
    });

    // 树接口
    this.meFormService.entryCodeItemChange.subscribe((data) => {
      this.enetryCodeItem = data.code;
      // 清空

      this.select = [];
      this.selectName = null;
      this.deviceSelect = null;
      this.deviceSelectName = null;
      this.pointName = '';
      this.name = null;
      this.submitSelect = [];
      this.submitDeviceSelect = null;
      // 选中的节点;
      this.submitDataList = {
        objectId: null,
        deviceId: null,
        pointNumber: null,
        standardPointCode: '',
        objectType: null,
        submit: false,
        objectName: '',
      };
    });

    // 树节点
    this.meObjectService.getTypeDataList.subscribe((data) => {
      this.treeSelectNodes = lodash.cloneDeep(data.typeTreeData) || [];
      this.treeSelectExpandedKeys = lodash.cloneDeep(data.typeExpandKeys) || [];
      // 清空选中的值
      this.select = [];
      this.selectName = null;
      this.deviceSelect = null;
      this.deviceSelectName = null;
      this.pointName = '';
      this.name = null;
      this.submitSelect = [];
      this.submitDeviceSelect = null;
    });
    // 重置
    this.meService.getIsResetType.subscribe((data) => {
      if (data.flag) {
        //console.log(this.enetryCodeItem)
        this.radioData.selectValue = 1;
        this.select = [];
        this.selectName = null;
        this.deviceSelect = null;
        this.deviceSelectName = null;
        this.pointName = '';
        this.name = null;
        this.submitSelect = [];
        this.submitDeviceSelect = null;
        this.enetryCodeItem = data.energyCode;
        // 重复调用接口，2023-10-12注释
        // this.meObjectService.getTypeList('00000');
        // 重新查询能源类型
        this.meService.getEnergy(this.radioData.selectValue, false);
      }
    });
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}
  /**
   * 开关
   */
  toggle(e: any) {
    this.isPanelShow = !this.isPanelShow;
    this.select = this.submitSelect; //console.log(this.select)
    this.deviceSelect = this.submitDeviceSelect;
    console.log(this.isPanelShow);
    if (this.name !== this.selectName) {
      this.selectName = lodash.cloneDeep(this.name);
    }
    this.treeTip =
      this.radioData.selectValue === 1
        ? '区域'
        : this.radioData.selectValue === 2
        ? '业态'
        : this.radioData.selectValue === 3
        ? '支路'
        : '';
    if (this.select && this.select.length === 0) {
      this.meObjectService.setDeviceData = [];
      this.meObjectService.setDeviceNodataMsg =
        '请先选择' + this.treeTip + '节点';
    } else {
      this.meObjectService.setDeviceData = this.submitDeviceData;
    }
    if (this.objectPosition === 'fixed') {
      // this.modalMask = 'calc(100vh - ' + e.y + 'px)';
      // this.modalTop = e.y + 'px';
    }
    const modalParent = window.document.querySelectorAll(
      '.me-batch-import-modal-add .me-form-content'
    );
    if (modalParent) {
      if (
        window.document.querySelectorAll(
          '.me-batch-import-modal-add .me-form-content'
        )[0]
      ) {
        window.document
          .querySelectorAll('.me-batch-import-modal-add .me-form-content')[0]
          .scrollTo(0, 0);
      }
    }
  }
  /**
   * 监听dom点击事件
   */
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.isPanelShow = false;
    }
  }
  // 清空选项
  clearSelect() {
    this.select = [];
    this.selectName = null;
    this.deviceSelect = null;
    this.deviceSelectName = null;
    this.pointName = '';
    this.name = null;
    this.submitSelect = [];
    this.submitDeviceSelect = null;
    let itemCode;
    if (this.meToolbarService.getModalFlag) {
      itemCode = '00000';
    } else {
      itemCode = this.enetryCodeItem;
    }
    // console.log(this.enetryCodeItem);
    // 重复调用接口，2023-10-12注释
    // this.meObjectService.getTypeList('00000');
    this.submitDataList = {
      objectId: null,
      deviceId: null,
      pointNumber: null,
      standardPointCode: null,
      objectType: null,
      submit: false,
      objectName: '',
    };
    this.meoTSubmitSelectChange.emit(this.submitDataList);
  }
  /**
   * 类型变换
   * @param item
   */
  radioModelChange(item: any) {
    // 清空选中数据
    this.searchValue = '';
    this.searchDeviceValue = '';
    this.meObjectService.setTypeTreeList = [];
    // this.meObjectService.setLoading = true;

    this.select = [];
    this.selectName = null;
    this.deviceSelect = null;
    this.deviceSelectName = null;
    this.pointName = '';
    this.name = null;
    this.submitSelect = [];
    this.submitDeviceSelect = null;
    let codeItem;
    if (this.meToolbarService.getModalFlag) {
      codeItem = '00000';
    } else {
      codeItem = this.meService.getEnergyCode;
    }
    // 能源类型
    // 重新查询能源类型
    this.meService.getEnergy(item, false);
    // 2023-10-12-只有打开录入弹框的时候才会调用
    if (this.meToolbarService.getModalFlag) {
      this.meObjectService.getTypeList('00000');
    }

    this.meObjectService.setDeviceLoading = false;
    this.meObjectService.setDeviceData = [];
    this.treeTip =
      this.radioData.selectValue === 1
        ? '区域'
        : this.radioData.selectValue === 2
        ? '业态'
        : this.radioData.selectValue === 3
        ? '支路'
        : '';
    this.meObjectService.setDeviceNodataMsg =
      '请先选择' + this.treeTip + '节点';

    // 类型变化
    if (!this.name) {
      this.submitDataList = {
        objectId: null,
        deviceId: null,
        pointNumber: null,
        standardPointCode: null,
        objectType: null,
        submit: false,
        objectName: '',
      };
      this.meoTSubmitSelectChange.emit(this.submitDataList);
    }
  }
  /**
   * 树选择
   * @param item
   */
  treeSelectNode(item: any) {
    this.deviceSelect = '';
    this.submitDeviceSelect = '';
    if (item.keys && item.keys.length > 0) {
      this.select = item.keys;
      this.selectName =
        item.selectedKeys && item.selectedKeys[0]
          ? item.selectedKeys[0].title
          : '';
      this.meObjectService.setDeviceLoading = true;

      if (!this.enetryCodeItem) {
        this.enetryCodeItem = this.energyCode;
      }
      const param = {
        energyCode: this.energyCode,
        treeId: Number(this.select[0]),
      };
      this.meObjectService.getDeviceList(param);
      this.objectIdType = '1';
    }
  }
  /**
   * 设备选中
   * @param deviceID
   * @param deviceName
   */
  deviceClick(data: deviceDataList) {
    if (
      data.deviceId === this.deviceSelect &&
      data.pointNumber === this.pointNumber
    ) {
      this.deviceSelect = null;
      this.deviceSelectName = null;
      this.pointName = '';
    } else {
      this.deviceSelect = data.deviceId;
      this.deviceSelectName = data.deviceName;
      this.pointName = data.pointName;
    }
    this.pointNumber = data.pointNumber;
    this.standardPointCode = data.standardPointCode;
    if (this.deviceSelect) {
      this.objectIdType = '2';
    } else {
      this.objectIdType = '1';
    }
  }
  /**
   * 确定
   */
  submit() {
    this.name = this.deviceSelectName;
    if (!this.deviceSelect && this.deviceSelect !== 0) {
      this.name = this.selectName || null;

      this.submitSelect = this.select;
      this.submitDeviceSelect = this.deviceSelect;
      this.submitDeviceData = this.deviceData;
      //this.objectIdType = '2';
    } else {
      this.name =
        `${this.deviceSelectName}${
          !!this.pointName ? `：${this.pointName}` : this.pointName
        }` || null;

      this.submitSelect = this.select;
      this.submitDeviceSelect = this.deviceSelect;
      this.submitDeviceData = this.deviceData;
      // this.objectIdType = '1';
    }
    this.submitDataList = {
      objectId:
        this.submitSelect && this.submitSelect.length > 0
          ? Number(this.submitSelect[0])
          : null,
      deviceId: this.submitDeviceSelect,
      pointNumber: this.pointNumber,
      standardPointCode: this.standardPointCode,
      objectType: this.objectIdType,
      submit: true,
      objectName:
        !this.deviceSelect && this.deviceSelect !== 0
          ? this.name
          : this.deviceSelectName,
    };
    if (!this.submitDataList.objectId) {
      this.deviceSelectName = null;
      this.pointName = '';
      this.selectName = '';
      this.name = '';
      this.select = [];
      this.nzMessage.error('请选择录入对象！');
      return;
    }

    this.isPanelShow = false;
    this.meoTSubmitSelectChange.emit(this.submitDataList);
  }
  /**
   * 取消
   */
  cancel() {
    this.isPanelShow = false;
    this.searchValue = '';
    this.searchDeviceValue = '';
    this.select = [];
    this.selectName = null;
    this.name = null;
    this.deviceSelect = null;
    this.deviceSelectName = null;
    this.pointName = '';
    this.submitSelect = [];
    this.submitDeviceSelect = null;
    this.meObjectService.setDeviceData = [];
    this.radioData.selectValue =
      this.radioData.data && this.radioData.data.length > 0
        ? this.radioData.data[0].value
        : null;
    this.treeTip =
      this.radioData.selectValue === 1
        ? '区域'
        : this.radioData.selectValue === 2
        ? '业态'
        : this.radioData.selectValue === 3
        ? '支路'
        : '';
    this.meObjectService.setDeviceNodataMsg =
      '请先选择' + this.treeTip + '节点';
    this.submitDataList = {
      objectId: null,
      deviceId: null,
      pointNumber: null,
      standardPointCode: '',
      objectType: null,
      submit: false,
      objectName: '',
    };
    // this.meObjectService.selectDdeviceDataList(this.submitDataList);
    this.meoTSubmitSelectChange.emit(this.submitDataList);
    let codeItem;
    if (this.meToolbarService.getModalFlag) {
      codeItem = '00000';
    } else {
      codeItem = this.enetryCodeItem;
    }
    // 重复调用接口，2023-10-12注释
    // this.meObjectService.getTypeList('00000');
    // 重新查询能源类型
    this.meService.getEnergy(this.radioData.selectValue, false);
  }
  cancelModal() {
    this.isPanelShow = false;
  }
}
