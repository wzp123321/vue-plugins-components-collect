import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavParams, ToastController } from '@ionic/angular';
import { ComponentsModule } from '@src/app/common/components/components.module';
import { EMEventTypeInfoItem } from '../../data-type';
import { EnergyEventsService } from '../../energy-events.service';
import { EnergyEventModalService } from './energy-event-modal.service';

@Component({
  selector: 'app-ems-events-modal',
  templateUrl: './ems-events-modal.component.html',
  styleUrls: ['./ems-events-modal.component.scss'],
  providers: [EnergyEventModalService],
})
export class EmsEventsModalComponent implements OnInit {
  isNewEvents = '/energyEvents/newEvents';
  modalParam: any = {
    id: null,
    eventTypeName: '',
  };
  isEnergyManager: boolean = false;
  EMEventTypeInfoItem: any;
  isItOpen: boolean = false;
  actionSheet: any;
  footerShow: boolean = true;
  isGoBack: boolean = false;
  isGoBackPower: boolean = false;
  isSelect: boolean;
  isSelectPower: boolean = false;
  radioAreaModal: any;
  changeTypeModal: any; // 变更性质
  EntryModeModal: any;
  EnergyNodeModal: any; // 设备选择

  private canGoBack: boolean = true;

  private toast: HTMLIonToastElement = null;
  airGoBack: boolean = true;
  constructor(
    private $route: ActivatedRoute,
    private $router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sEnergyEventModal: EnergyEventModalService,
    private service: EnergyEventsService,
    private ctrlToast: ToastController
  ) {}

  ngOnInit(): void {
    this.getQueryParam();
    this.service.sessionStorageFunction('calendar-energy', 'closed');
    this.service.sessionStorageFunction('calendar-power', 'closed');
  }
  async goBack() {
    if (!this.canGoBack) {
      this.sEnergyEventModal.toHandleGoBack.emit();
      return;
    }
    //  console.log(this.isItOpen, this.isSelectPower, this.isSelect);
    // 拍照弹窗是否关闭
    const deviceModal = sessionStorage.getItem('slide-up');
    console.log('slide-up', deviceModal);
    if (deviceModal === 'true') {
      sessionStorage.setItem('slide-up', 'closed');
      // this.sessionStorageFunction('slide-up', 'closed');
      this.service.sessionStorageFunction('slide-up', 'closed');
      return;
    }

    const energyModal = sessionStorage.getItem('energu-up');
    console.log('energyModal', energyModal);
    if (energyModal === 'true') {
      sessionStorage.setItem('energu-up', 'closed');
      // this.sessionStorageFunction('slide-up', 'closed');
      this.service.sessionStorageFunction('energu-up', 'closed');
      return;
    }

    const calendaEnergy = await sessionStorage.getItem('calendar-energy');
    //   console.log('this.airGoBack',this.airGoBack)
    if (!this.airGoBack) {
      this.sEnergyEventModal.toHandleGoBack.emit();
      return;
    }
    if (this.radioAreaModal) {
      this.ModalClose(this.radioAreaModal);
      return;
    }
    if (this.changeTypeModal) {
      this.ModalClose(this.changeTypeModal);
      return;
    }
    if (this.EntryModeModal) {
      this.ModalClose(this.EntryModeModal);
      return;
    }
    if (this.EnergyNodeModal) {
      this.ModalClose(this.EnergyNodeModal);
      return;
    }
    if (this.isItOpen) {
      this.isItOpen = false;
      this.recordPopUpClose();
      return;
      // this.isGoBack = false;
    }
    if (this.isSelectPower && !this.isItOpen) {
      this.isGoBackPower = true;
      this.sEnergyEventModal.toHandleGoBack.emit();
      return;
    }
    if (this.isSelect && !this.isItOpen) {
      // 日历弹窗是否关闭
      this.isGoBack = true;
      this.sEnergyEventModal.toHandleGoBack.emit();
      return;
    }
    //  if (!this.isItOpen && !this.isSelect) {
    // this.isGoBack = false;

    this.cdr.detectChanges();
    // console.log(this.isNewEvents)
    this.ngZone.run(() => {
      this.$router
        .navigate([this.isNewEvents], {
          queryParams: {
            isEnergyManager: this.isEnergyManager,
          },
        })
        .then();
    });

    //  }
  }
  imgChnage(item: any) {
    if (item) {
      this.isItOpen = true;
      this.actionSheet = item;
    } else {
      this.isItOpen = false;
    }
  }
  // 关闭底部
  async recordPopUpClose() {
    if (this.actionSheet) {
      await this.actionSheet.dismiss();
    }
  }
  // 判断是否那个modal
  getQueryParam() {
    this.$route.queryParams.subscribe((param) => {
      if (Object.keys(param).length === 0) {
        return;
      }
      this.modalParam = param;
      this.isEnergyManager = param.isEnergyManager;
    });
  }
  calendarShow(item: boolean) {
    this.isSelect = item;
    if (item) {
      this.footerShow = false;
    } else {
      this.isGoBack = false;
      this.footerShow = true;
    }
    this.cdr.detectChanges();
  }
  calendarPowerShow(item: boolean) {
    this.isSelectPower = item;
    if (item) {
      this.footerShow = false;
      this.isGoBackPower = false;
    } else {
      this.footerShow = true;
      this.isGoBackPower = false;
    }

    this.cdr.detectChanges();
  }
  radioAreaShow(item: any) {
    this.radioAreaModal = item;
  }
  // async radioAreaClose() {
  //   if (this.radioAreaModal) {
  //    const data =  await this.radioAreaModal.dismiss();
  //    console.log(data)
  //     this.radioAreaModal = null;
  //   }
  // }
  // 变更性质
  changeType(item: any) {
    this.changeTypeModal = item;
  }
  // 录入方式
  EntryModeChange(item: any) {
    this.EntryModeModal = item;
  }
  // 设备选择
  EnergyNodeChange(item: any) {
    this.EnergyNodeModal = item;
  }
  // async changeTypeClose() {
  //   if (this.changeTypeModal) {
  //    const data =  await this.changeTypeModal.dismiss();
  //     this.changeTypeModal = null;
  //   }
  // }
  async ModalClose(item: any) {
    if (item) {
      const data = await item.dismiss();
      item = null;
      this.radioAreaModal = null;
      this.changeTypeModal = null;
      this.EntryModeModal = null;
      this.EnergyNodeModal = null;
    }
  }

  public async doSave(): Promise<void> {
    if (!this.toast) {
      if (this.sEnergyEventModal.canSave) {
        const res = await this.sEnergyEventModal.save();
        if (res) {
          await this.presentToast('保存成功');
          await this.toast.onDidDismiss();
          this.canGoBack = true;
          this.toast = null;
          this.goBack();
        } else {
          await this.presentToast('保存失败');
          await this.toast.onDidDismiss();
          this.canGoBack = true;
          this.toast = null;
        }
      } else {
        await this.presentToast('请填写必填项');
        await this.toast.onDidDismiss();
        this.canGoBack = true;
        this.toast = null;
        const element: HTMLIonContentElement = document.querySelector('ion-content');
        this.sEnergyEventModal.toHandleInvalid.emit(element);
      }
    }
  }

  public handleModalState(state: { canGoBack: boolean; canShowFooter: boolean }): void {
    this.canGoBack = state.canGoBack;
    this.footerShow = state.canShowFooter;
  }

  // 空调
  airConditionOperation(item: any) {
    this.airGoBack = item.airGoBack;
    this.footerShow = item.footerShow;
    this.isGoBackPower = false;
  }

  private async presentToast(message: string): Promise<void> {
    this.toast = await this.ctrlToast.create({
      cssClass: 'toast',
      mode: 'md',
      position: 'middle',
      message,
      duration: 2000,
    });
    await this.toast.present();
    this.canGoBack = false;
  }
}
