import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, LOCALE_ID, OnDestroy, OnInit, Output, Self } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { EmsRadioAreaComponent } from '../../ems-radio-area/ems-radio-area.component';
import { EEntryMode, IRegionalBusinessAdjustmentEvent } from '../../energy-events.api';
import { NewEnergyEventService } from '../new-energy-event.service';
import { RegionalBusinessAdjustmentService } from './regional-business-adjustment.service';

const ENTRY_MODE_MAP: Map<number, string> = new Map([
  [+EEntryMode.Binding, '区域选择'],
  [+EEntryMode.Manual, '人工录入'],
]);

@Component({
  selector: 'app-regional-business-adjustment-modal',
  templateUrl: './regional-business-adjustment-modal.component.html',
  styleUrls: ['./regional-business-adjustment-modal.component.scss'],
  providers: [RegionalBusinessAdjustmentService],
  viewProviders: [
    {
      provide: NewEnergyEventService,
      useExisting: RegionalBusinessAdjustmentService,
    },
  ],
})
export class RegionalBusinessAdjustmentModalComponent implements OnInit, OnDestroy {
  @Output('onToggleModal')
  public onToggleModal: EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }> = new EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }>();

  public get canShowEmptyMarker(): boolean {
    return this.service.canShowEmptyMarker;
  }
  public get isShowBinding(): boolean {
    return EEntryMode.Binding === this.data.entryMode;
  }
  public get isShowManual(): boolean {
    return EEntryMode.Manual === this.data.entryMode;
  }

  public get data(): IRegionalBusinessAdjustmentEvent {
    return this.service.data;
  }

  public region: IRegion = {
    key: null,
    title: null,
    parentId: null,
    children: false,
    allNode: '',
  };

  public startTimeSelector: ICalendar = {
    date: this.data.startTime ? new Date(this.data.startTime) : null,
    min: this.data.endTime ? new Date(`${new Date(this.data.endTime).getFullYear()}/1/1`) : null,
    max: this.data.endTime ? new Date(this.data.endTime) : new Date(),
    show: false,
    onSelect: (date: Date) => {
      if (date) {
        this.data.startTime = formatDate(date, 'yyyy-MM-dd', this.locale);
        this.endTimeSelector.min = date;
        const newDate = new Date();
        const yearV = new Date(`${date.getFullYear()}/12/31`);
        //console.log(formatDate(yearV, 'yyyy-MM-dd', this.locale), this.data.startTime)
        if (yearV.getTime() > date.getTime()) {
          if (yearV.getTime() < newDate.getTime()) {
            this.endTimeSelector.max = yearV;
          } else {
            this.endTimeSelector.max = newDate;
          }
        } else {
          this.endTimeSelector.max = new Date(`${date.getFullYear()}/12/31`);
        }

        this.dismissStartTimeSelector();
      }
    },
  };
  public endTimeSelector: ICalendar = {
    date: this.data.endTime ? new Date(this.data.endTime) : null,
    min: this.data.startTime ? new Date(this.data.startTime) : null,
    max: this.data.startTime ? new Date(`${new Date(this.data.startTime).getFullYear()}/12/31`) : new Date(),
    show: false,
    onSelect: (date: Date) => {
      if (date) {
        this.data.endTime = formatDate(date, 'yyyy-MM-dd', this.locale);
        this.startTimeSelector.min = new Date(`${date.getFullYear()}/1/1`);
        this.startTimeSelector.max = date;
        this.dismissEndTimeSelector();
      }
    },
  };

  private entryModeSelector: HTMLIonActionSheetElement = null;
  private areaSelector: HTMLIonModalElement = null;
  private imageSelector: HTMLIonActionSheetElement = null;
  saveClick = 0;
  constructor(
    @Self()
    private service: RegionalBusinessAdjustmentService,
    @Inject(LOCALE_ID) private locale: string,
    private ctrlActionSheet: ActionSheetController,
    private ctrlModal: ModalController
  ) {
    this.service.toHandleInvalid.subscribe((v: HTMLIonContentElement) => {
      if (v) {
        this.service.canShowEmptyMarker = true;
        v.scrollToPoint(0, this.getJumpPoint(this.service.validator));
      }
    });
    this.service.toHandleGoBack.subscribe(() => {
      if (this.startTimeSelector.show) {
        this.dismissStartTimeSelector();
      }
      if (this.endTimeSelector.show) {
        this.dismissEndTimeSelector();
      }
      if (this.entryModeSelector) {
        this.entryModeSelector.dismiss();
      }
      if (this.areaSelector) {
        this.areaSelector.dismiss();
      }
      if (this.imageSelector) {
        this.imageSelector.dismiss();
      }
    });
    this.data.filePaths = [];
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.service.toHandleInvalid.unsubscribe();
    this.service.toHandleGoBack.unsubscribe();
  }

  public presentStartTimeSelector(): void {
    this.startTimeSelector.show = true;
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: false,
    });
  }
  public dismissStartTimeSelector(): void {
    this.startTimeSelector.show = false;
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public presentEndTimeSelector(): void {
    this.endTimeSelector.show = true;
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: false,
    });
  }
  public dismissEndTimeSelector(): void {
    this.endTimeSelector.show = false;
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public async presentEntryModeSelector(): Promise<void> {
    this.entryModeSelector = await this.ctrlActionSheet.create({
      cssClass: '--entry-mode-selector',
      mode: 'md',
      header: '录入方式',
      buttons: [
        {
          text: this.matchEntryMode(+EEntryMode.Binding),
          handler: () => {
            this.data.entryMode = EEntryMode.Binding;
            this.data.relationData = [];
          },
        },
        {
          text: this.matchEntryMode(+EEntryMode.Manual),
          handler: () => {
            this.data.entryMode = EEntryMode.Manual;
            this.data.energyObjects = '';
          },
        },
      ],
    });
    await this.entryModeSelector.present();
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: true,
    });
    await this.entryModeSelector.onDidDismiss();
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public async presentAreaSelector(): Promise<void> {
    this.areaSelector = await this.ctrlModal.create({
      component: EmsRadioAreaComponent,
      mode: 'md',
      componentProps: {
        areaId: this.region.parentId,
        userName: this.region.title,
        children: this.region.children,
        childrenSelectId: this.region.key,
      },
    });
    await this.areaSelector.present();
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: true,
    });
    const data = (await this.areaSelector.onDidDismiss()).data;
    if (data && data.result && data.result.item) {
      this.region = data.result.item;
      this.region.allNode = this.region.allNode.replace(/>/g, '/');
      this.data.energyObjects = this.region.key?.toString();
    }
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public matchEntryMode(key: number): string {
    return ENTRY_MODE_MAP.get(key) || null;
  }

  public onDetailChange(message: string): void {
    this.data.eventDetail = message;
  }

  public handleImageModalChange(modal: HTMLIonActionSheetElement): void {
    this.imageSelector = modal;
    if (this.imageSelector) {
      this.onToggleModal.emit({
        canGoBack: false,
        canShowFooter: true,
      });
    } else {
      this.onToggleModal.emit({
        canGoBack: true,
        canShowFooter: true,
      });
    }
  }

  private getJumpPoint(id: string): number {
    this.saveClick += 1;
    const element: HTMLElement = document.getElementById(id);
    return element.offsetTop ? element.offsetTop - 15 : null;
  }
}

interface ICalendar {
  date: Date;
  show: boolean;
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
}

interface IRegion {
  key: number;
  title: string;
  parentId: number;
  children: boolean;
  allNode: string;
}
