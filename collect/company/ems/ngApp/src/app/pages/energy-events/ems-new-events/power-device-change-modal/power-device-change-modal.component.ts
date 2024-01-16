import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  Input,
  SimpleChanges,
  ElementRef,
  Self,
  SkipSelf,
} from '@angular/core';
import { IEnergyCode, IExtraEvent, IPowerDeviceChangeEvent } from '../../energy-events.api';
import { PowerDeviceChangeService } from './power-device-change.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { NativeService } from '@src/app/common/native.service';
import { EmsSelectPopUpComponent } from '../../ems-select-pop-up/ems-select-pop-up.component';
import { changeTypeList, entryModelist } from '../../data-type';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { EmsMultipleDeviceComponent } from '../../ems-multiple-device/ems-multiple-device.component';
import * as lodash from 'lodash';
import { EnergyEventsService } from '../../energy-events.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NewEnergyEventService } from '../new-energy-event.service';
@Component({
  selector: 'app-power-device-change-modal',
  templateUrl: './power-device-change-modal.component.html',
  styleUrls: ['./power-device-change-modal.component.scss'],
  providers: [PowerDeviceChangeService, DatePipe],
  viewProviders: [
    {
      provide: NewEnergyEventService,
      useExisting: PowerDeviceChangeService,
    },
  ],
})
export class PowerDeviceChangeModalComponent implements OnInit {
  @Input() isGoBack: boolean = false;
  @Output() imageChangeClick = new EventEmitter();
  @Output() CalendarPowerDom = new EventEmitter();
  @Output() clickType = new EventEmitter();
  attachList: any = [];
  isEnergyManager: boolean = false;
  timeStartLableTip: string = '选择'; // 开始时间
  // 日历
  startState: any;
  selectStartDate: Date = null;
  timeEndLableTip: string = '选择'; // 结束时间
  endState: any = {
    en: false,
    date: null,
    show: false,
    pickTime: false,
    now: new Date(),
    type: 'one',
    enterDirection: '',
    rowSize: 'normal',
    showShortcut: false,
    infinite: true,
    defaultValue: undefined,
    onSelect: undefined,
  };
  selecEndDate: Date = null;

  // 变更性质
  changeTypeName: string = '';
  changeTypeLableTip: string = '选择'; //
  modalType: any; // 变更性质弹窗

  // 录入方式
  entryModeName: string = '';
  entryModeLableTip: string = '选择';
  entryModeModal: any;

  // 设备选择
  energyNodeName: string = '';
  energyNodeLableTip: string = '选择';
  energyNodeModal: any;
  energySelectDevice: any;

  // 人工录入
  relationData: any = [];
  isAddClick: any;
  ItemCodeList: any = []; // 能源类型
  ItemCodeModal: any; // 能源类型Modal
  operationRelation: boolean = false; // 是否出现删除操作
  delectOperationShow: boolean = false; // 默认不出现删除
  selectEngeryChecked: boolean = false; // 默认确定删除的颜色
  decimalEC = '10,4';
  // isShowEmptyMarker: boolean = false; // 没有输入提示
  public get isShowEmptyMarker(): boolean {
    // 没有输入提示,红框输入就消失
    return this.sPowerDeviceChange.canShowEmptyMarker;
  }
  public get data(): IPowerDeviceChangeEvent {
    return this.sPowerDeviceChange.data;
  }
  public get energyCodeArray(): IEnergyCode[] {
    return this.energyEventService.energyCodeArray;
  }
  constructor(
    @Self()
    private sPowerDeviceChange: PowerDeviceChangeService,
    private datePipe: DatePipe,
    private $router: Router,
    private $route: ActivatedRoute,
    public modalController: ModalController,
    private nativeService: NativeService,
    private cdr: ChangeDetectorRef,
    private service: EnergyEventsService,
    private elementRef: ElementRef,
    private energyEventService: NewEnergyEventService<IExtraEvent>
  ) {
    this.sPowerDeviceChange.toHandleInvalid.subscribe((v: HTMLIonContentElement) => {
      if (v) {
        this.sPowerDeviceChange.canShowEmptyMarker = true;
        v.scrollToPoint(0, this.getJumpPoint(this.sPowerDeviceChange.validator));
        this.relationData = lodash.forEach(this.relationData, (item) => {
          item.newControl = false;
        });
      }
    });

    // 日历
    this.sPowerDeviceChange.toHandleGoBack.subscribe(() => {
      if (this.startState.show) {
        this.startState.show = false;
        this.CalendarPowerDom.emit(false);
      }
    });
    this.data.filePaths = [];
  }
  private getJumpPoint(id: string): number {
    const element: HTMLElement = document.getElementById(id);
    return element.offsetTop ? element.offsetTop - 15 : null;
  }
  ngOnInit(): void {
    this.initStartPara();
  }
  ngOnDestroy(): void {
    this.sPowerDeviceChange.toHandleInvalid.unsubscribe();
    this.sPowerDeviceChange.toHandleGoBack.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isGoBack) {
      const currentValue = changes.isGoBack.currentValue;
      if (currentValue) {
        this.isGoBack = currentValue;
        this.startState = {
          ...this.startState,
          ...{ show: false },
        };
        this.CalendarPowerDom.emit(false);
        sessionStorage.setItem('calendar-power', 'false');
        this.service.sessionStorageFunction('calendar-power', 'false');
        this.onCancel();
        this.cdr.detectChanges();
      }
    }
  }

  // 开始时间
  timeChangeClick(item: any) {
    this.startState = {
      ...this.startState,
      ...{
        show: true,
        date: this.selectStartDate,
        max: new Date(),
        defaultDate: this.selectStartDate,
        defaultValue: [this.selectStartDate],
      },
    };
    this.CalendarPowerDom.emit(true);
    sessionStorage.setItem('calendar-power', 'true');
    this.service.sessionStorageFunction('calendar-power', 'true');
  }
  // 开始日期
  initStartPara() {
    this.startState = {
      ...this.startState,
      ...{
        show: false,
        date: null,
        pickTime: false,
        now: new Date(),
        max: new Date(),
        type: 'one',
        rowSize: 'normal',
        enterDirection: '',
        onSelect: (date: Date) => {
          if (date) {
            const startDate = this.datePipe.transform(date, 'yyyy-MM-dd');
            this.data.startTime = startDate;
            this.startState.date = date;
            this.startState.now = date;
            this.selectStartDate = date;
            this.startState.show = false;
            this.timeStartLableTip = '更改';
          } else {
            this.timeStartLableTip = '选择';
            throw new Error('我出错 了onSelect');
          }
          this.CalendarPowerDom.emit(this.startState.show);
          sessionStorage.setItem('calendar-power', 'false');
          this.service.sessionStorageFunction('calendar-power', 'false');
        },
        showShortcut: false,
        defaultValue: [null],
      },
    };
    sessionStorage.setItem('calendar-power', 'false');
    this.service.sessionStorageFunction('calendar-power', 'false');
  }
  // 结束
  timeEndChangeClick(item: any) {
    this.endState = {
      ...this.endState,
      ...{
        show: true,
        date: this.selecEndDate,
        defaultDate: this.selecEndDate,
        defaultValue: [this.selecEndDate],
      },
    };

    //  this.CalendarDom.emit(this.endState.show);
  }
  // 结束日期
  initEndtPara() {
    this.endState = {
      ...this.endState,
      ...{
        show: false,
        date: null,
        pickTime: false,
        now: new Date(),
        type: 'one',
        rowSize: 'normal',
        enterDirection: '',
        minDate: this.selectStartDate ? [this.selectStartDate] : new Date(),
        onSelect: (date: Date) => {
          if (date) {
            const endState = this.datePipe.transform(date, 'yyyy-MM-dd');
            this.data.endTime = endState;
            this.endState.date = date;
            this.endState.now = date;
            this.selecEndDate = date;
            //  this.CalendarDom.emit(false);
            this.endState.show = false;
            this.timeEndLableTip = '更改';
          } else {
            this.timeEndLableTip = '选择';
            throw new Error('我出错 了onSelect');
          }
        },
        showShortcut: false,
        defaultValue: [null],
      },
    };
  }
  // 开始时间取消
  onCancel(): void {
    this.startState.show = false;
    this.CalendarPowerDom.emit(this.startState.show);
    sessionStorage.setItem('calendar-power', 'false');
    this.service.sessionStorageFunction('calendar-power', 'false');
  }
  // 结束时间取消
  onCancelEnd(): void {
    this.endState.show = false;
    //  this.CalendarDom.emit(this.endState.show);
  }
  // 判断是否是从能源经理入口
  getQueryParam() {
    this.$route.queryParams.subscribe((param) => {
      if (Object.keys(param).length === 0) {
        return;
      }
      this.isEnergyManager = param.isEnergyManager;
    });
  }

  // 变更性质
  async changeType(item: any) {
    this.modalType = await this.modalController.create({
      component: EmsSelectPopUpComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      showBackdrop: true,
      cssClass: 'changeType',
      componentProps: {
        title: '变更性质',
        changeTypeList: changeTypeList,
        lineStyle: 1,
      },
    });
    await this.modalType.present();
    // 是否已打开
    this.clickType.emit(this.modalType);
    // 关闭返回的值
    if (this.modalType) {
      const data = await this.modalType.onDidDismiss();
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.closed) {
              this.clickType.emit(null);
            }
            if (result.item) {
              this.changeTypeName = result.item.label;
              this.data.changeType = result.item.value?.toString();
              this.changeTypeLableTip = '更改';
            } else {
              this.changeTypeLableTip = '选择';
            }
          } else {
            this.changeTypeLableTip = '选择';
          }
        }
      }
    }
    if (this.modalType) {
      const finsh = await this.modalType.dismiss();
      if (!finsh) {
        this.clickType.emit(null);
      }
    }
  }

  // 录入方式
  async entryModeChange(item: any) {
    this.entryModeModal = await this.modalController.create({
      component: EmsSelectPopUpComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      showBackdrop: true,
      cssClass: 'changeType',
      componentProps: {
        title: '录入方式',
        changeTypeList: entryModelist,
        lineStyle: 1,
      },
    });
    await this.entryModeModal.present();
    // 是否已打开
    this.clickType.emit(this.entryModeModal);
    // 关闭返回的值
    if (this.entryModeModal) {
      const data = await this.entryModeModal.onDidDismiss();
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.closed) {
              this.clickType.emit(null);
            }
            if (result.item) {
              this.entryModeName = result.item.label;
              this.data.entryMode = result.item.value?.toString();
              if (+this.data.entryMode === 2) {
                // 设备
                this.energySelectDevice = [];
                this.data.energyObjects = null;
                this.energyNodeName = '';
                // 能源类型
                this.ItemCodeList = this.energyCodeArray;
                //  this.getItemCodeData(); // 分类分项
                // 默认一个能源用量
                this.relationData = [];
                const control: any = {
                  id: 0,
                  energyItemCode: '',
                  energyItemCodeName: '',
                  energyConsumption: null,
                  unit: '',
                  checked: false,
                  energyEventItemId: 'energyConsumption0',
                  remove: false,
                };

                this.relationData.push(control);
                this.data.relationData = lodash.map(this.relationData, (item) => {
                  return {
                    energyCode: item.energyItemCode,
                    codeValue: +item.energyConsumption,
                    energyCodeUnit: item.unit,
                    energyCodeName: item.energyItemCodeName,
                  };
                });
                // console.log('this.data.relationData', this.data.relationData);
                this.sPowerDeviceChange.doCheck();
              } else {
                this.relationData = [];
                this.data.relationData = [];
              }

              this.operationRelation = false;
              this.entryModeLableTip = '更改';
            } else {
              this.entryModeLableTip = '选择';
            }
          } else {
            this.entryModeLableTip = '选择';
          }
        }
      }
    }
    if (this.entryModeModal) {
      const finsh = await this.entryModeModal.dismiss();
      if (!finsh) {
        this.clickType.emit(null);
      }
    }
  }

  // 设备选择
  async equipmentChange(item: any) {
    sessionStorage.removeItem('slide-up');
    this.energyNodeModal = await this.modalController.create({
      component: EmsMultipleDeviceComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      cssClass: ' ',
      componentProps: {
        title: '选择设备',
        selectDevice: this.energySelectDevice,
      },
    });
    await this.energyNodeModal.present();
    // 是否已打开
    this.clickType.emit(this.energyNodeModal);
    // 关闭返回的值
    if (this.energyNodeModal) {
      const data = await this.energyNodeModal.onDidDismiss();
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.selectDeviceList) {
              this.energySelectDevice = result.selectDeviceList;
              const selectDevice = result.selectDeviceList;
              const selectDeviceId = lodash.map(selectDevice, (item) => {
                return item.deviceId;
              });
              this.data.energyObjects = selectDeviceId.join(',');
              const energyNodeNameData = lodash.map(selectDevice, (item) => {
                return item.deviceName;
              });
              this.energyNodeName = energyNodeNameData.join('、');
              this.energyNodeLableTip = '更改';
            } else {
              this.energyNodeLableTip = '选择';
            }
          } else {
            this.energyNodeLableTip = '选择';
          }
        }
      }
    }
    if (this.energyNodeModal) {
      const finsh = await this.entryModeModal.dismiss();
      if (!finsh) {
        this.clickType.emit(null);
        sessionStorage.removeItem('slide-up');
      }
    }
  }
  /**
   *
   * @param e 人工录入=====
   */
  // 新增能源用量
  plusEnergy(e: Event) {
    if (e) {
      e.preventDefault();
    }
    const id = this.relationData.length > 0 ? this.relationData[this.relationData.length - 1].id + 1 : 0;

    const control: any = {
      id,
      energyItemCode: '',
      energyItemCodeName: '',
      energyConsumption: null,
      unit: '',
      checked: false,
      energyEventItemId: 'energyConsumption' + id,
      remove: false,
      newControl: true,
    };

    const index = this.relationData.push(control);
    // this.data.relationData = this.relationData;
    this.data.relationData = lodash.map(this.relationData, (item) => {
      //  console.log('人工录入===', item);
      return {
        energyCode: item.energyItemCode,
        codeValue: +item.energyConsumption,
        energyCodeUnit: item.unit,
        energyCodeName: item.energyItemCodeName,
      };
    });

    this.sPowerDeviceChange.doCheck();
  }
  // 获取分类分项集合
  async getItemCodeData() {
    try {
      const data = await this.service.getEnergyCodeList();
      this.ItemCodeList = data;
    } catch (error) {
      // this.presentLoadingWithOptions(error.message);
      //  console.log(error.message)
    }
  }
  // 能源类型Modal
  async selectItemCodeModel(control: any, index: number) {
    const codeList = lodash.forEach(this.ItemCodeList, (item) => {
      item.label = item.name;
      item.itemCode = item.code;
      item.remove = false;
    });
    this.ItemCodeModal = await this.modalController.create({
      component: EmsSelectPopUpComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      showBackdrop: true,
      cssClass: 'changeType',
      componentProps: {
        title: '能源类型',
        changeTypeList: codeList,
        lineStyle: 2,
        selectData: this.relationData,
      },
    });
    await this.ItemCodeModal.present();
    this.clickType.emit(this.ItemCodeModal);
    // 关闭返回的值
    if (this.ItemCodeModal) {
      const data = await this.ItemCodeModal.onDidDismiss();
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.closed) {
              this.clickType.emit(null);
            }
            control.energyItemCode = result.item.code;
            control.energyItemCodeName = result.item.name;
            control.unit = result.item.unit;
            control.pright = result.item.unit.length * 14 + 20 + 'px';
            //  this.data.relationData[index].energyConsumption = control.energyConsumption;
            this.data.relationData[index].energyCodeUnit = control.unit;
            this.data.relationData[index].energyCode = control.energyItemCode;
            this.data.relationData[index].energyCodeName = control.energyItemCodeName;
            // console.log('发挥', this.data.relationData);
            this.sPowerDeviceChange.doCheck();
            if (control.energyItemCode) {
              this.operationRelation = true;
            }
          } else {
          }
        }
      }
    }
    if (this.ItemCodeModal) {
      const finsh = await this.entryModeModal.dismiss();
      if (!finsh) {
        this.clickType.emit(null);
      }
    }
  }
  // 删除操作出现多选框
  delectOperation() {
    this.delectOperationShow = true;
    this.selectEngeryChecked = false;
  }
  // 取消删除操作
  cancelDelect() {
    this.delectOperationShow = false;
    const relationDataCancel = lodash.forEach(this.relationData, (item) => {
      item.checked = false;
    });
  }
  // 选中删除的数据
  selectEnergyDate(item: any, index: number) {
    const noSelect = lodash.filter(this.relationData, ['checked', true]);
    if (noSelect.length === 0) {
      this.selectEngeryChecked = false;
    } else {
      this.selectEngeryChecked = true;
    }
  }
  // 确认删除
  onDeleteEnergy() {
    if (!this.selectEngeryChecked) {
      return;
    }
    this.relationData = lodash.remove(this.relationData, (item: any) => {
      if (item && !item.checked) {
        return item;
      }
    });
    if (this.relationData.length > 0) {
      this.selectEngeryChecked = false;
      this.delectOperationShow = false;
    } else {
      this.operationRelation = false;
      this.selectEngeryChecked = false;
      this.delectOperationShow = false;
      const control: any = {
        id: 0,
        energyItemCode: '',
        energyItemCodeName: '',
        energyConsumption: null,
        unit: '',
        checked: false,
        energyEventItemId: 'energyConsumption0',
        remove: false,
      };
      this.relationData.push(control);
    }
    this.sPowerDeviceChange.doCheck();
    // this.data.relationData = this.relationData;
    this.data.relationData = lodash.map(this.relationData, (item) => {
      return {
        energyCode: item.energyItemCode,
        codeValue: +item.energyConsumption,
        energyCodeUnit: item.unit,
        energyCodeName: item.energyItemCodeName,
      };
    });
  }
  // 能源用量的数值
  energyChangeValue(item: any, eventId: number, energyIndex: number) {
    const value: string = item.detail.value;
    let newValue;
    newValue = this.checkInputText(item, value);

    const energyEventId = '#' + eventId;
    const energyEvent = this.elementRef.nativeElement.querySelector(energyEventId);
    if (energyEvent) {
      energyEvent.value = newValue;
    }
    // console.log('energyEvent.value', energyEvent.value);
    this.data.relationData[energyIndex].codeValue = +newValue;
    this.sPowerDeviceChange.doCheck();
  }
  // 最多四位小数
  checkInputText(event: Event, text: string) {
    const reg = /^(\.*)(\d+)(\.?)(\d{0,4}).*$/g;

    if (reg.test(text)) {
      //正则匹配通过，提取有效文本
      text = text.replace(reg, '$2$3$4').replace(/^0+/, '0');
    } else {
      //正则匹配不通过，直接清空
      text = '';
    }
    reg.lastIndex = 0;
    return text; //返回符合要求的文本（为数字且最多有带2位小数）
  }
  public checkInput(event: KeyboardEvent, value: string | number): void {
    const reg: RegExp = /(^\d$)|(^\.$)/;
    if (!reg.test(event.key)) {
      event.returnValue = false;
      return;
    }
    if (!value) {
      return;
    }
    value = value as string;
    if (value.includes('.')) {
      if ('.' === event.key || 1 < value.split('.')[1].length) {
        event.returnValue = false;
        return;
      }
    }
    if ('0' === event.key && '0' === value) {
      event.returnValue = false;
      return;
    }
  }
  // 下标
  trackByIndex(index: number, item: any) {
    return item.id;
  }
  // 事件详情
  speechChangeDetail(item: string) {
    this.data.eventDetail = item;
    this.sPowerDeviceChange.doCheck();
  }
  imageClick(item: any) {
    this.imageChangeClick.emit(item);
  }
}
