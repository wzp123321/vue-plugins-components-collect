import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import * as lodash from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { EnergyEventsService } from '../energy-events.service';
import { EmsSelectDeviceModalComponent } from './ems-select-device-modal/ems-select-device-modal.component';

@Component({
  selector: 'app-ems-multiple-device',
  templateUrl: './ems-multiple-device.component.html',
  styleUrls: ['./ems-multiple-device.component.scss'],
})
export class EmsMultipleDeviceComponent implements OnInit {
  isEnergyManager: boolean = false;
  searchNameChange = new Subject();
  destroy = new Subject();
  isSearch: boolean = false; // 是否是搜索
  deviceName: string = ''; // 设备名称
  listHeight: string = ''; // 距离顶部的高

  loading: any;
  noData: boolean = false;
  noDescription: string = '';

  deviceListData: any = [];
  queryName: any = {
    title: '',
  };

  initSelectDevice: any = [];
  selectDeviceData: any = []; // 选中设备的列表数据
  selectDeviceModal: any; // 选中弹窗
  selectIdList: any = []; // 选中设备的id结合

  stateShow: boolean = false; // modal弹窗
  isOKClick: boolean = false; // 是否点击了确定按钮

  pageSize: number = 10;
  pageIndex: number = 1;
  pageTotal: number = 1;
  total: number = 0;
  isDrop: boolean = true;

  pagingData: any = [];

  dropUpSetTime: NodeJS.Timeout = null;
  private toast: HTMLIonToastElement = null;

  keyCodeClick: boolean = false;
  orignalSetItem = sessionStorage.setItem;
  constructor(
    public navParams: NavParams,
    private $route: ActivatedRoute,
    private el: ElementRef,
    private service: EnergyEventsService,
    private loadingController: LoadingController,
    public modalController: ModalController,
    private ctrlToast: ToastController
  ) {}

  ngOnInit(): void {
    // 搜搜
    this.searchNameChange
      .pipe(
        debounceTime(100),
        map((e) => {
          //  this.deviceName.trim();
          return e;
        }), // 删除字符串左右空格
        takeUntil(this.destroy)
      )
      .subscribe((res: any) => {
        if (res) {
          // if (res.detail.value) {
          //   this.isSearch = true;
          // } else {
          //   this.isSearch = false;
          // }
          if ((window.event ? res.keyCode : res.which) === 13) {
            res.target.blur();
          } else {
            this.keyCodeClick = false;
          }

          //   console.log(this.deviceListData)
        }
      });
    // 是否有选中的设备
    if (this.navParams.data) {
      this.selectDeviceData = [];
      const selectDeviceList = this.navParams.data.selectDevice;
      //  console.log('s', selectDeviceList);
      if (selectDeviceList && this.selectDeviceData.length === 0) {
        this.initSelectDevice = selectDeviceList;
      } else {
        this.initSelectDevice = [];
      }
    } else {
      this.initSelectDevice = [];
    }
    this.selectDeviceData = [];
    this.selectDeviceData = this.initSelectDevice;
    if (this.initSelectDevice.length > 0) {
      this.selectIdList = lodash.map(this.initSelectDevice, (item: any) => {
        return item.deviceId;
      });
    }
    // console.log('init1', this.initSelectDevice, this.selectDeviceData);
    this.getDropdownDeviceListData();
    setTimeout(() => {
      this.listMaeginTop();
    }, 300);
    sessionStorage.removeItem('energu-up');
    const info = sessionStorage.getItem('slide-up');
    if (info) {
    } else {
      // 监听‘setItemEvent’sessionStorage变化
      window.addEventListener('setItemEvent', (e: any) => {
        if ((e.key = 'loginInfor')) {
          const _this = sessionStorage.getItem('slide-up');
          if (_this === 'closed') {
            this.stateShow = false;
            // sessionStorage.setItem("slide-up", 'false');
          }
        }
      });
    }
  }
  // 失去焦点
  searchNameBlur(event: any) {
    // console.log('失去焦点', this.keyCodeClick);
    // if (!this.keyCodeClick) {
    this.isSearch = true;
    // console.log(this.deviceName);
    this.deviceListData = [];
    // this.deviceName = res.detail.value;
    // this.queryName.title = res.detail.value;
    this.queryName.title = this.deviceName;
    this.pageIndex = 1;
    this.isDrop = false;
    this.getDropdownDeviceListData(); // 具体需要防抖的函数
    // }
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
  // 返回
  goBack() {
    if (!this.isOKClick) {
      this.selectDeviceData = [];
    }
    // console.log('init2', this.initSelectDevice);
    this.doClose();
  }
  //关闭模态对话框
  doClose() {
    // console.log('init3', this.isOKClick, this.initSelectDevice);
    if (!this.isOKClick && this.initSelectDevice.length === 0) {
      this.selectDeviceData = [];
    } else if (!this.isOKClick && this.initSelectDevice.length !== 0) {
      this.selectDeviceData = [];
      lodash.forEach(this.initSelectDevice, (inititem) => {
        this.selectDeviceData.push(inititem);
      });
    }

    if (this.selectDeviceData.length > 0) {
      this.selectIdList = lodash.map(this.selectDeviceData, (item: any) => {
        return item.deviceId;
      });
    }
    //  console.log(this.selectDeviceData);
    this.navParams.data.modal.dismiss({
      result: {
        closed: true,
        selectDeviceList: this.selectDeviceData,
      },
    });
  }
  // 别表距离头部的高
  listMaeginTop() {
    const crumssHeight = this.el.nativeElement.querySelector('.modal-content-list');
    let crH;
    if (crumssHeight) {
      crH = crumssHeight.offsetHeight;
    } else {
      crH = 62;
    }

    this.listHeight = crH + 144 + 'px';
  }
  // 能源事件类型下拉列表
  async getDropdownDeviceListData() {
    if (this.pageIndex === 1) {
      this.loading = await this.presentLoading();
    }
    const param = {
      deviceName: this.deviceName,
      deviceIds: this.selectIdList,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };
    //  console.log('this.pageIndex', this.pageIndex);

    this.service
      .getDropdownDeviceList(param)
      .then((data) => {
        if (data) {
          //this.deviceListData = data.list;
          this.pageTotal = data.pages;
          if (this.pageTotal > 1) {
            this.isDrop = true;
          } else {
            this.isDrop = false;
          }
          this.pageIndex = data.pageNum;
          this.total = data.total;
          if (data.list && data.list.length > 0) {
            this.noData = false;
            // for (let i = 0; i < this.deviceListData.length; i++) {
            //   const element = this.deviceListData[i];
            //   element.checked = false;
            //   lodash.forEach(this.initSelectDevice, (item) => {
            //      if (element.deviceId === item.deviceId) {
            //       element.checked = true;
            //      }
            //   })
            // }
            for (let i = 0; i < data.list.length; i++) {
              const element = data.list[i];
              if (this.selectDeviceData && this.selectDeviceData.length > 0) {
                for (let j = 0; j < this.selectDeviceData.length; j++) {
                  const selectItem = this.selectDeviceData[j];
                  if (selectItem.deviceId === element.deviceId) {
                    element.checked = true;
                  }
                }
              }
              this.deviceListData.push(element);
            }
            this.deviceListData = lodash.uniq(this.deviceListData);
            this.listMaeginTop();
          } else {
            this.noData = true;
            if (this.isSearch) {
              this.noDescription = '没有搜索到您想要的信息';
            } else {
              this.noDescription = '暂无数据';
            }
          }
        }
      })
      .catch((error) => {
        this.noData = true;
        this.noDescription = error.message;
        // this.presentLoadingWithOptions(error.message);
      })
      .finally(() => {
        this.loading.dismiss();
      });
  }
  pullup(event: any) {
    if (this.dropUpSetTime) {
      return;
      //  clearTimeout(this.dropUpSetTime);
    }
    this.dropUpSetTime = setTimeout(() => {
      event.target.complete();
      let upPage;
      // if ((this.pageIndex - 1) > 1) {
      //   upPage = this.pageIndex - 1;
      // } else if ((this.pageIndex - 1) === 1) {
      //   upPage = 1;
      // } else {
      //   this.dropUpSetTime=null;
      //   return;
      // }
      // this.pageIndex = upPage;
      this.pageIndex = 1; // meiy
      this.deviceListData = [];
      this.getDropdownDeviceListData();
      // const contentTop = this.el.nativeElement.querySelector('.modal-content');
      // contentTop.scrollToTop();
      this.dropUpSetTime = null;
    }, 300);
  }
  // 下拉反页
  doRefresh(event: any) {
    if (this.dropUpSetTime) {
      return;
      //clearTimeout(this.dropUpSetTime);
    }
    // console.log(this.pageIndex, this.pageIndex + 1, this.pageTotal);
    this.dropUpSetTime = setTimeout(() => {
      let pageIndexNow;
      if (this.pageIndex + 1 < this.pageTotal) {
        pageIndexNow = this.pageIndex + 1;
        this.isDrop = true;
      } else if (this.pageIndex + 1 === this.pageTotal) {
        pageIndexNow = this.pageTotal;
        this.isDrop = false;
      } else if (this.pageIndex + 1 > this.pageTotal) {
        this.isDrop = false;
        event.target.disabled = true;
        this.dropUpSetTime = null;
        return;
      }
      this.pageIndex = pageIndexNow;
      //console.log('pageIndexNow', this.pageIndex);
      this.getDropdownDeviceListData();
      const contentTop = this.el.nativeElement.querySelector('.modal-content');
      // contentTop.scrollToTop();
      event.target.complete();
      this.dropUpSetTime = null;
    }, 300);
  }
  // loading
  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      cssClass: 'my-device-class',
      message: ' ',
    });
    await loading.present();
    return loading;
  }
  trackById(index: number, item: any): number {
    return item.deviceId;
  }
  // 选中了多少个设备列表
  async selectDeviceListChange(item: any, index: number, event: any) {
    if (this.initSelectDevice.length === 0) {
      this.initSelectDevice = [];
    }

    item.checked = !item.checked;

    this.dataSelect(item, '');
    // if (item.checked) {
    //   const isIndex = lodash.findIndex(this.selectDeviceData, item);
    //   if (isIndex < 0) {
    //     this.selectDeviceData.push(item);
    //   }

    // } else {
    //   this.selectDeviceData = lodash.pull(this.selectDeviceData, item);
    // }
    // this.selectDeviceData = lodash.uniq(this.selectDeviceData);
  }
  async selectDeviceDate(item: any, index: number, event: any) {
    this.dataSelect(item, event);
    //  if (item.checked) {
    //    const isIndex = lodash.findIndex(this.selectDeviceData, item);
    //    if (isIndex < 0) {
    //      this.selectDeviceData.push(item);
    //    }

    //  } else {
    //    this.selectDeviceData = lodash.pull(this.selectDeviceData, item);
    //  }
    //  this.selectDeviceData = lodash.uniq(this.selectDeviceData);
  }
  // 选中数据的处理
  async dataSelect(item: any, event: any) {
    item.disabled = false;
    // if (this.selectDeviceData.length > 9) {
    //   item.checked = false; console.log(this.selectDeviceData.length, item.checked)
    // }
    if (item.checked) {
      const isIndex = lodash.findIndex(this.selectDeviceData, item);
      if (isIndex < 0) {
        if (this.selectDeviceData.length > 9) {
          item.checked = false;
          if (event) {
            if (event.detail) {
              event.detail.checked = false;
              event.target.checked = false;
            }
          }
          await this.presentToast('最多可选择10个设备');

          await this.toast.onDidDismiss();
        } else {
          this.selectDeviceData.push(item);
        }
      }
    } else {
      lodash.remove(this.selectDeviceData, (currentObject: any) => {
        return currentObject.deviceId === item.deviceId;
      });
    }
    this.selectDeviceData = lodash.uniq(this.selectDeviceData);
  }
  // 选择列表弹窗
  async selectModal() {
    if (this.stateShow) {
      this.stateShow = false;
      sessionStorage.setItem('slide-up', 'false');
      this.service.sessionStorageFunction('slide-up', 'false');
    } else {
      this.stateShow = true;
      sessionStorage.setItem('slide-up', 'true');
      this.service.sessionStorageFunction('slide-up', 'true');
    }

    // this.sessionStorageFunction('slide-up', 'true');
    //  this._listener( )
    setTimeout(() => {
      this.dialogHeight();
    });
  }
  sessionStorageFunction(key: string, newValue: string) {
    let setItemEvent: any = new Event('setItemEvent');
    setItemEvent.newValue = newValue;
    window.dispatchEvent(setItemEvent);
    //  this.orignalSetItem.apply(this, arguments);
  }
  // 关闭已选弹窗
  onClose() {
    this.stateShow = false;
    sessionStorage.setItem('slide-up', 'false');
    // this.sessionStorageFunction('slide-up', 'false');
    this.service.sessionStorageFunction('slide-up', 'true');
  }
  // 清空
  emptyData() {
    this.selectDeviceData = [];

    if (this.deviceListData && this.deviceListData.length > 0) {
      lodash.forEach(this.deviceListData, (item) => {
        item.checked = false;
      });
    }
    this.stateShow = false;
  }
  // 删除一个设备
  deleteDecive(item: any) {
    this.selectDeviceData = lodash.pull(this.selectDeviceData, item);
    this.selectDeviceData = lodash.uniq(this.selectDeviceData);
    let findData: any = lodash.find(this.deviceListData, item);
    findData.checked = false;
    if (this.selectDeviceData && this.selectDeviceData.length === 0) {
      this.stateShow = false;
    }

    setTimeout(() => {
      this.dialogHeight();
    });
  }
  // 确定选中的设备
  determineSelectDevice() {
    this.isOKClick = true;
    if (this.stateShow) {
      this.stateShow = false;
    }

    this.doClose();
  }
  dialogHeight() {
    const div = window.document.getElementsByClassName('select-device-modal-list');
    div[0].setAttribute('style', 'height:' + (this.selectDeviceData.length + 2) * 62 + 'px; ');
  }
  // 提示
  private async presentToast(message: string): Promise<void> {
    this.toast = await this.ctrlToast.create({
      cssClass: 'toast',
      mode: 'md',
      position: 'middle',
      message,
      duration: 600,
    });
    await this.toast.present();
  }
}
