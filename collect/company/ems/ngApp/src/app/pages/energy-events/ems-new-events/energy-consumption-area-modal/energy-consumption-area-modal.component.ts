import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Self,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { NativeService } from '@src/app/common/native.service';
import { throwError } from 'rxjs';
import { EmsRadioAreaComponent } from '../../ems-radio-area/ems-radio-area.component';
import { IEnergyConsumptionAreaChangeEvent } from '../../energy-events.api';
import { EnergyEventsService } from '../../energy-events.service';
import { NewEnergyEventService } from '../new-energy-event.service';
import { EnergyConsumptionAreaService } from './energy-consumption-area.service';

@Component({
  selector: 'app-energy-consumption-area-modal',
  templateUrl: './energy-consumption-area-modal.component.html',
  styleUrls: ['./energy-consumption-area-modal.component.scss'],
  providers: [DatePipe, EnergyConsumptionAreaService],
  viewProviders: [
    {
      provide: NewEnergyEventService,
      useExisting: EnergyConsumptionAreaService,
    },
  ],
})
export class EnergyConsumptionAreaModalComponent implements OnInit, OnChanges {
  areaNamError: boolean = false;
  attachList: any = [];
  @Input() isGoBack: boolean;
  @Output() imageChangeClick = new EventEmitter();
  @Output() CalendarDom = new EventEmitter();
  @Output() clickArea = new EventEmitter();
  timeLableTip: string = '选择';
  regionName: string = '';
  regionId: number = null;
  regionLableTip: string = '选择';
  // 日历
  state: any = {
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
  selectDate: Date = null;
  isShowRadioArea: boolean = false; // 区域
  isEnergyManager: boolean = false;
  isEventsModal = '/energyEvents/newEventsModal';

  modalArea: any;
  isGoback: boolean = false;

  regionNodeChildren: boolean = false;
  regionParentId: string;

  // isShowEmptyMarker: boolean = false;
  public get isShowEmptyMarker(): boolean {
    // 没有输入提示,红框输入就消失
    return this.sEnergyConsumptionArea.canShowEmptyMarker;
  }
  public get data(): IEnergyConsumptionAreaChangeEvent {
    return this.sEnergyConsumptionArea.data;
  }

  constructor(
    private datePipe: DatePipe,
    private $router: Router,
    private $route: ActivatedRoute,
    public modalController: ModalController,
    private nativeService: NativeService,
    private cdr: ChangeDetectorRef,
    @Self()
    private sEnergyConsumptionArea: EnergyConsumptionAreaService,

    private service: EnergyEventsService
  ) {
    this.sEnergyConsumptionArea.toHandleInvalid.subscribe(
      (v: HTMLIonContentElement) => {
        if (v) {
          this.sEnergyConsumptionArea.canShowEmptyMarker = true;
          v.scrollToPoint(
            0,
            this.getJumpPoint(this.sEnergyConsumptionArea.validator)
          );
        }
      }
    );
    // 日历
    this.sEnergyConsumptionArea.toHandleGoBack.subscribe(() => {
      if (this.state.show) {
        this.state.show = false;
        this.CalendarDom.emit(false);
      }
    });
    this.data.filePaths = [];
  }
  private getJumpPoint(id: string): number {
    const element: HTMLElement = document.getElementById(id);
    return element.offsetTop ? element.offsetTop - 15 : null;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isGoBack) {
      const currentValue = changes.isGoBack.currentValue;
      if (currentValue) {
        this.isGoback = currentValue;
        if (this.data.energyObjects) {
          this.regionLableTip = '更改';
        }
        this.CalendarDom.emit(false);
        this.state = {
          ...this.state,
          ...{ show: false },
        };
        this.onCancel();
        this.cdr.detectChanges();
      }
    }
  }

  async ngOnInit() {
    const info = sessionStorage.getItem('calendar-energy');
    window.addEventListener('setItemEvent', (e: any) => {
      if ((e.key = 'loginInfor')) {
        const _this = sessionStorage.getItem('calendar-energy');
        if (_this === 'closed') {
          this.state = {
            ...this.state,
            ...{ show: false },
          };
          sessionStorage.setItem('calendar-energy', 'false');
        }
      }
    });
    this.getQueryParam();
    this.initPara();
  }
  // 事件详情
  speechChangeDetail(item: string) {
    this.data.eventDetail = item;
  }
  imageClick(item: any) {
    this.imageChangeClick.emit(item);
  }
  // 时间
  timeChangeClick(item: any) {
    this.state = {
      ...this.state,
      ...{
        show: true,
        date: this.selectDate,
        max: new Date(),
        defaultDate: this.selectDate,
        defaultValue: [this.selectDate],
      },
    };

    this.CalendarDom.emit(this.state.show);
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
  // 区域
  async regionChangeClick(item: any) {
    this.modalArea = await this.modalController.create({
      component: EmsRadioAreaComponent,
      mode: 'md',
      componentProps: {
        isGoback: this.isGoback,
        areaId: this.regionParentId,
        userName: this.regionName,
        children: this.regionNodeChildren,
        childrenSelectId: this.regionId,
      },
    });
    await this.modalArea.present();
    // 是否已打开
    this.clickArea.emit(this.modalArea);

    // 关闭返回的值
    if (this.modalArea) {
      const data = await this.modalArea.onDidDismiss();
      // console.log('data', data);
      if (data) {
        if (data.data) {
          if (data.data.result) {
            const result = data.data.result;
            const itemNode = result.item;
            if (itemNode) {
              this.regionId = itemNode.key;
              if (itemNode.allNode) {
                this.regionName = itemNode.allNode.replace(/>/g, '/');
              } else {
                this.regionName = itemNode.title;
              }

              this.regionNodeChildren = itemNode.children;
              this.regionParentId = itemNode.parentId;
              this.regionLableTip = '更改';
              this.data.energyObjects = itemNode.key?.toString();
            } else {
              this.regionLableTip = '选择';
            }
          } else {
            this.regionLableTip = '选择';
          }
        }
      }
    }
    if (this.modalArea) {
      const finsh = await this.modalArea.dismiss();
      if (!finsh) {
        this.clickArea.emit(null);
      }
    }
  }

  // 日期
  initPara() {
    this.state = {
      ...this.state,
      ...{
        show: false,
        date: null,
        pickTime: false,
        now: new Date(),
        type: 'one',
        rowSize: 'normal',
        enterDirection: '',
        onSelect: (date: Date) => {
          if (date) {
            const startDate = this.datePipe.transform(date, 'yyyy-MM-dd');
            this.data.startTime = startDate;
            this.state.date = date;
            this.state.now = date;
            this.selectDate = date;
            this.CalendarDom.emit(false);
            this.state.show = false;
            this.timeLableTip = '更改';
          } else {
            this.timeLableTip = '选择';
            throw new Error('我出错 了onSelect');
          }
        },
        showShortcut: false,
        defaultValue: [null],
        // defaultValue: [new Date(+new Date() - 86400000), new Date(+new Date() - 345600000)],
        // getDateExtra: (date: Date) => {

        //   const today = new Date(new Date().toLocaleDateString());

        // }
      },
    };
  }
  onCancel(): void {
    this.state.show = false;
    this.CalendarDom.emit(this.state.show);
  }
  onConfirm(date: any) {
    this.state.show = false;
    this.CalendarDom.emit(this.state.show);
  }
}
