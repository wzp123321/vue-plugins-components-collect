import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  Self,
} from '@angular/core';
import {
  IAirConditionSupplyAdjustmentEvent,
  IEnergyCode,
  IExtraEvent,
} from '../../energy-events.api';
import { NewEnergyEventService } from '../new-energy-event.service';
import { AirConditionSupplyAdjustmentService } from './air-condition-supply-adjustment.service';
import { adjustmentTypeList } from '../../data-type';
import { EmsSelectPopUpComponent } from '../../ems-select-pop-up/ems-select-pop-up.component';
import { ModalController, ToastController } from '@ionic/angular';
import { formatDate, ShareActionSheetWithOptions } from 'ng-zorro-antd-mobile';
import { LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as lodash from 'lodash';
import { endOfYear, startOfYear } from 'date-fns';
import { EmsMultipleEnergyNodeComponent } from '../../ems-multiple-energy-node/ems-multiple-energy-node.component';
@Component({
  selector: 'app-air-condition-supply-adjustment-modal',
  templateUrl: './air-condition-supply-adjustment-modal.component.html',
  styleUrls: ['./air-condition-supply-adjustment-modal.component.scss'],
  providers: [AirConditionSupplyAdjustmentService, DatePipe],
  viewProviders: [
    {
      provide: NewEnergyEventService,
      useExisting: AirConditionSupplyAdjustmentService,
    },
  ],
})
export class AirConditionSupplyAdjustmentModalComponent implements OnInit {
  @Output() airConditionModal = new EventEmitter();
  eventTitle: string = ''; // 事件标题
  adjustmentTypeName: string = ''; // 调整方式
  attachList: any = []; // 上传照片
  attachHtml: HTMLIonActionSheetElement = null; // 拍照弹窗
  adjustmentTypeModal: any; // 调整方式

  entryModeName: string = ''; // 录入方式name
  energyModeModal: HTMLIonModalElement = null; // 录入modal
  energyModeList: any = [
    {
      value: 1,
      label: '绑定能耗节点',
    },
    {
      value: 2,
      label: '人工录入',
    },
  ];
  // 能耗节点
  energyNodeName: string = '';
  energyNodeModal: HTMLIonModalElement = null; // 能耗节点Modal
  energySelectNode: any = [];
  isGoback: boolean = false;

  // 人工录入
  relationData: any = [];
  isAddClick: any;
  ItemCodeList: any = []; // 能源类型
  ItemCodeModal: HTMLIonModalElement = null; // 能源类型Modal
  operationRelation: boolean = false; // 是否出现删除操作
  delectOperationShow: boolean = false; // 默认不出现删除
  selectEngeryChecked: boolean = false; // 默认确定删除的颜色

  isEnergyManager: boolean = false; // 跳转

  energyOkGoBack: boolean = false;

  private toast: HTMLIonToastElement = null;

  public startState: any = {
    date: this.data.startTime ? new Date(this.data.startTime) : null,
    max: null,
    min: null,
    show: false,
    now: new Date(),
    onSelect: (date: Date) => {
      if (date) {
        /**
         * 如果调整时间未定，则可以任意选  如果调整时间定了需要根据调整方式做限制
         * 提早开---大于调整时间并小于调整时间所在的年尾
         * 推迟关---小于调整时间并大于调整时间所在的年初
         */
        this.startState.now = date;
        this.data.startTime = this.datePipe.transform(date, 'yyyy-MM-dd');

        this.dismissStartTimeSelector();
      }
    },
  };
  public endState: any = {
    date: this.data.endTime ? new Date(this.data.endTime) : null,
    min: null,
    max: null,
    show: false,
    now: new Date(),
    defaultValue: [null],
    onSelect: (date: Date) => {
      if (date) {
        this.endState.now = date;
        this.endState.defaultValue = [date];
        this.data.endTime = this.datePipe.transform(date, 'yyyy-MM-dd');

        this.dismissEndTimeSelector();
      }
    },
  };

  decimalEC = '10,4';
  public get data(): IAirConditionSupplyAdjustmentEvent {
    return this.sAirConditionSupplyAdjustment.data;
  }
  public get isShowEmptyMarker(): boolean {
    // 没有输入提示,红框输入就消失\
    return this.sAirConditionSupplyAdjustment.canShowEmptyMarker;
  }
  public get energyCodeArray(): IEnergyCode[] {
    return this.energyEventService.energyCodeArray;
  }
  constructor(
    @Self()
    private sAirConditionSupplyAdjustment: AirConditionSupplyAdjustmentService,
    public modalController: ModalController,
    @Inject(LOCALE_ID) private locale: string,
    private datePipe: DatePipe,
    private energyEventService: NewEnergyEventService<IExtraEvent>,
    private $route: ActivatedRoute,
    private elementRef: ElementRef,
    private ctrlToast: ToastController
  ) {
    this.sAirConditionSupplyAdjustment.toHandleInvalid.subscribe(
      (v: HTMLIonContentElement) => {
        if (v) {
          this.sAirConditionSupplyAdjustment.canShowEmptyMarker = true;
          v.scrollToPoint(
            0,
            this.getJumpPoint(this.sAirConditionSupplyAdjustment.validator)
          );
          this.relationData = lodash.forEach(this.relationData, (item) => {
            item.newControl = false;
          });
        }
      }
    );

    //  弹簧物理键关闭

    this.sAirConditionSupplyAdjustment.toHandleGoBack.subscribe(() => {
      // 拍照
      if (this.attachHtml) {
        this.clocseImage();
      }
      // 调整方式
      if (this.adjustmentTypeModal) {
        this.adjustmentTypeModal.dismiss();
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
      }
      // 原定时间
      if (this.startState.show) {
        this.dismissStartTimeSelector();
      }
      // 调整时间
      if (this.endState.show) {
        this.dismissEndTimeSelector();
      }
      // 录入方式
      if (this.energyModeModal) {
        this.energyModeModal.dismiss();
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
      }
      // 节点选择
      if (this.energyNodeModal) {
        this.energyNodeModal.dismiss();
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
      }
      // 能源类型
      if (this.ItemCodeModal) {
        this.ItemCodeModal.dismiss();
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
      }
      // 确定
      this.energyOkGoBack = true;
    });
    // 清空拍照 --刚进页面
    this.data.filePaths = [];
  }
  private getJumpPoint(id: string): number {
    const element: HTMLElement = document.getElementById(id);
    return element.offsetTop ? element.offsetTop - 15 : null;
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.sAirConditionSupplyAdjustment.toHandleInvalid.unsubscribe();
    this.sAirConditionSupplyAdjustment.toHandleGoBack.unsubscribe();
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
  // 调整方式
  async adjustmentTypChange(item: any) {
    this.energyModeModal = await this.modalController.create({
      component: EmsSelectPopUpComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      showBackdrop: true,
      cssClass: 'changeType',
      componentProps: {
        title: '调整方式',
        changeTypeList: adjustmentTypeList,
        lineStyle: 1,
      },
    });
    await this.energyModeModal.present();
    // 是否已打开
    this.airConditionModal.emit({
      airGoBack: false,
      footerShow: true,
    });
    // 关闭返回的值
    if (this.energyModeModal) {
      const data = await this.energyModeModal.onDidDismiss();
      this.airConditionModal.emit({
        airGoBack: true,
        footerShow: true,
      });
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.item) {
              this.data.adjustmentType = result.item.value?.toString();
              this.adjustmentTypeName = result.item.label;
              this.startState.max = null;
              this.startState.min = null;
              this.startState.defaultValue = [];
              this.startState.now = new Date();
              this.endState.max = null;
              this.endState.min = null;
              this.endState.defaultValue = [];
              this.endState.now = new Date();
              this.data.startTime = '';
              this.data.endTime = '';
            } else {
            }
            this.sAirConditionSupplyAdjustment.doCheck();
          }
        }
      }
    }
    if (this.energyModeModal) {
      const finsh = await this.energyModeModal.dismiss();
      if (!finsh) {
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
      }
    }

    console.log(this.startState, this.endState);
  }
  // 原定时间
  async timeChangeClick(item: any) {
    if (this.data.adjustmentType) {
      if (+this.data.adjustmentType === 1) {
        // 提早开
        if (this.data.endTime) {
          this.startState.min = new Date(this.data.endTime);
          this.startState.max = endOfYear(new Date(this.data.endTime));
        } else {
          this.startState.min = null;
          this.startState.max = null;
        }
      } else {
        // 推迟关
        if (this.data.endTime) {
          this.startState.max = new Date(this.data.endTime);
          this.startState.min = startOfYear(new Date(this.data.endTime));
        } else {
          this.startState.min = null;
          this.startState.max = null;
        }
      }
      this.presentStartTimeSelector();
    } else {
      await this.presentToast('请先选择调整方式');
      await this.toast.onDidDismiss();
    }
  }
  // 调整时间
  async timeEndChangeClick(item: any) {
    if (this.data.adjustmentType) {
      if (+this.data.adjustmentType === 1) {
        // 提早开
        if (this.data.startTime) {
          this.endState.min = startOfYear(new Date(this.data.startTime));
          this.endState.max = new Date(this.data.startTime);
        } else {
          this.endState.min = null;
          this.endState.max = null;
        }
      } else {
        // 推迟关
        if (this.data.startTime) {
          this.endState.min = new Date(this.data.startTime);
          this.endState.max = endOfYear(new Date(this.data.startTime));
        } else {
          this.endState.min = null;
          this.endState.max = null;
        }
      }

      this.presentEndTimeSelector();
    } else {
      await this.presentToast('请先选择调整方式');
      await this.toast.onDidDismiss();
    }
  }
  // 原定时间打开
  public presentStartTimeSelector(): void {
    this.startState.defaultValue = this.data.startTime
      ? [new Date(this.data.startTime)]
      : [];
    this.startState.now = this.data.startTime
      ? new Date(this.data.startTime)
      : new Date();
    this.startState.show = true;

    this.airConditionModal.emit({
      airGoBack: false,
      footerShow: false,
    });
  }
  // 原定时间关闭
  public dismissStartTimeSelector(): void {
    this.startState.show = false;
    this.airConditionModal.emit({
      airGoBack: true,
      footerShow: true,
    });
  }
  // 调整时间打开
  public presentEndTimeSelector(): void {
    this.endState.defaultValue = this.data.endTime
      ? [new Date(this.data.endTime)]
      : [new Date()];
    this.startState.now = this.data.endTime
      ? new Date(this.data.endTime)
      : new Date();
    this.endState.show = true;

    this.airConditionModal.emit({
      airGoBack: false,
      footerShow: false,
    });
  }
  // 调整时间关闭
  public dismissEndTimeSelector(): void {
    this.endState.show = false;
    this.airConditionModal.emit({
      airGoBack: true,
      footerShow: true,
    });
  }
  onCancel() {
    this.dismissStartTimeSelector();
  }
  disableDate(date: Date[]) {
    console.log(date);
  }
  onCancelEnd() {
    this.dismissEndTimeSelector();
  }
  // 录入方式弹窗
  async entryModeChange(item: any) {
    this.adjustmentTypeModal = await this.modalController.create({
      component: EmsSelectPopUpComponent,
      mode: 'md',
      backdropDismiss: true,
      keyboardClose: true,
      showBackdrop: true,
      cssClass: 'changeType',
      componentProps: {
        title: '录入方式',
        changeTypeList: this.energyModeList,
        lineStyle: 1,
      },
    });
    await this.adjustmentTypeModal.present();
    // 是否已打开
    if (this.adjustmentTypeModal) {
      this.airConditionModal.emit({
        airGoBack: false,
        footerShow: true,
      });
    }

    // 关闭返回的值
    if (this.adjustmentTypeModal) {
      const data = await this.adjustmentTypeModal.onDidDismiss();
      this.airConditionModal.emit({
        airGoBack: true,
        footerShow: true,
      });
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.item) {
              this.data.entryMode = result.item.value?.toString();
              this.entryModeName = result.item.label;
              if (+this.data.entryMode === 2) {
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
                  newControl: false,
                };

                this.relationData.push(control);
                this.data.relationData = lodash.map(
                  this.relationData,
                  (item) => {
                    return {
                      energyCode: item.energyItemCode,
                      codeValue: +item.energyConsumption,
                      energyCodeUnit: item.unit,
                      energyCodeName: item.energyCodeName,
                    };
                  }
                );
                this.sAirConditionSupplyAdjustment.doCheck();
              } else {
              }

              this.operationRelation = false;
            } else {
            }
            this.sAirConditionSupplyAdjustment.doCheck();
          }
        }
      }
    }
    if (this.adjustmentTypeModal) {
      const finsh = await this.adjustmentTypeModal.dismiss();
      if (!finsh) {
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
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
    const id =
      this.relationData.length > 0
        ? this.relationData[this.relationData.length - 1].id + 1
        : 0;

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
      return {
        energyCode: item.energyItemCode,
        codeValue: +item.energyConsumption,
        energyCodeUnit: item.unit,
        energyCodeName: item.energyItemCodeName,
      };
    });

    this.sAirConditionSupplyAdjustment.doCheck();
  }
  // 能源类型Modal
  async selectItemCodeModel(control: any, index: number) {
    const codeList = lodash.forEach(this.ItemCodeList, (item) => {
      item.label = item.name;
      item.itemCode = item.code;
      item.remove = false;
    });
    //  console.log(codeList);
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
    this.airConditionModal.emit({
      airGoBack: false,
      footerShow: true,
    });
    // 关闭返回的值
    if (this.ItemCodeModal) {
      const data = await this.ItemCodeModal.onDidDismiss();
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            if (result.closed) {
              this.airConditionModal.emit({
                airGoBack: true,
                footerShow: true,
              });
            }
            control.energyItemCode = result.item.code;
            control.energyItemCodeName = result.item.name;
            control.unit = result.item.unit;
            control.pright = result.item.unit.length * 14 + 20 + 'px';
            //  this.data.relationData[index].energyConsumption = control.energyConsumption;
            this.data.relationData[index].energyCodeUnit = control.unit;
            this.data.relationData[index].energyCode = control.energyItemCode;
            this.data.relationData[index].energyCodeName =
              control.energyItemCodeName;
            this.sAirConditionSupplyAdjustment.doCheck();
            if (control.energyItemCode) {
              this.operationRelation = true;
            }
          } else {
          }
        }
      }
    }
    if (this.ItemCodeModal) {
      const finsh = await this.ItemCodeModal.dismiss();
      if (!finsh) {
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
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
    this.sAirConditionSupplyAdjustment.doCheck();
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
    newValue = this.checkInputText(
      item,
      value,
      Number(this.data.relationData[energyIndex].codeValue)
    );

    const energyEventId = '#' + eventId;
    const energyEvent =
      this.elementRef.nativeElement.querySelector(energyEventId);

    if (energyEvent) {
      energyEvent.value = newValue;
    }
    //  console.log('energyEvent.value',energyEvent.value)
    this.data.relationData[energyIndex].codeValue = +newValue;
    this.sAirConditionSupplyAdjustment.doCheck();
  }
  getEnergyNum(e: any, index: number) {
    this.data.relationData[index].codeValue = +e.target.value;
    this.sAirConditionSupplyAdjustment.doCheck();
  }
  // 最多两位小数
  checkInputText(event: Event, text: string, oldValue: number) {
    const reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g;

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
    if (
      ((event.keyCode < 48 || event.keyCode > 57) && event.keyCode != 46) ||
      /\.\d\d$/.test(value)
    )
      event.returnValue = false;
  }
  // 下标
  trackByIndex(index: number, item: any) {
    return item.id;
  }
  // 能耗节点变化
  async energyNodeChange(item: any) {
    sessionStorage.removeItem('energu-up');
    this.energyNodeModal = await this.modalController.create({
      component: EmsMultipleEnergyNodeComponent,
      mode: 'md',
      componentProps: {
        isGoback: this.isGoback,
        energySelectNode: this.energySelectNode,
        airConditionModal: this.airConditionModal,
        energyIsGoBack: this.energyOkGoBack,
      },
    });
    await this.energyNodeModal.present();
    // 是否已打开
    this.airConditionModal.emit({
      airGoBack: false,
      footerShow: true,
    });
    // 关闭返回的值
    if (this.energyNodeModal) {
      const data = await this.energyNodeModal.onDidDismiss();
      if (data) {
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            const itemNode = result.item;
            if (itemNode) {
              this.energySelectNode = itemNode;
              this.energyNodeName = lodash
                .map(itemNode, (item) => {
                  return item.allNode;
                })
                .join('、')
                .replace(/>/g, '/');
              this.data.energyObjects = lodash
                .map(itemNode, (item) => {
                  return item.key;
                })
                .join(',');
            } else {
            }
          } else {
          }
        }
      }
    }
    if (this.energyNodeModal) {
      const finsh = await this.energyNodeModal.dismiss();
      if (!finsh) {
        this.airConditionModal.emit({
          airGoBack: true,
          footerShow: true,
        });
        sessionStorage.removeItem('energu-up');
      }
    }
  }
  // 事件详情
  speechChangeDetail(item: string) {
    this.data.eventDetail = item;
    this.sAirConditionSupplyAdjustment.doCheck();
  }
  // 拍照
  async imageClick(item: any) {
    this.attachHtml = item;
    if (this.attachHtml) {
      this.airConditionModal.emit({
        airGoBack: false,
        footerShow: true,
      });
    } else {
      this.airConditionModal.emit({
        airGoBack: true,
        footerShow: true,
      });
    }
  }
  async clocseImage() {
    await this.attachHtml.dismiss();
    this.airConditionModal.emit({
      airGoBack: true,
      footerShow: true,
    });
  }

  // 提示
  private async presentToast(message: string): Promise<void> {
    this.toast = await this.ctrlToast.create({
      cssClass: 'toast',
      mode: 'md',
      position: 'middle',
      message,
      duration: 2000,
    });
    await this.toast.present();
  }

  // num() {
  //   if(this.data.eventTitle)
  //   return Array.from(this.data.eventTitle).length;

  // }
}
interface ICalendar {
  date: Date;
  show: boolean;
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
}
