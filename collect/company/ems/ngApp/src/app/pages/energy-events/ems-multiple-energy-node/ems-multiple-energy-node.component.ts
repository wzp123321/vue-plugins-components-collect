import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavParams, ToastController } from '@ionic/angular';
import { AppService } from '@src/app/app.service';
import { isThisISOWeek } from 'date-fns';
import * as lodash from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { EnergyEventModalService } from '../ems-new-events/ems-events-modal/energy-event-modal.service';
import { EnergyEventsService } from '../energy-events.service';

@Component({
  selector: 'app-ems-multiple-energy-node',
  templateUrl: './ems-multiple-energy-node.component.html',
  styleUrls: ['./ems-multiple-energy-node.component.scss'],
})
export class EmsMultipleEnergyNodeComponent implements OnInit {
  isEnergyManager: boolean = false;
  listHeight: string;
  energyNodeName: string = ''; //搜索区域名字
  energyId: number = 0;
  userId: string = '';
  crumbsListData: any = [];
  formatListData: any = [];
  destroy = new Subject();
  searchNameChange = new Subject();
  loading: any;
  isSearch: boolean = false; // 是否是搜索
  noData: boolean = false;
  topValue: string = 'calc(100% - 159px)';
  noDescription: string = '';

  formartAllListData: any = []; // 全部节点
  childrenList: any = []; // 有下级的节点
  noChildrenList: any = []; // 没有下级的节点
  selectNodeList: any = []; // 选中节点
  stateShow: boolean = false; // 能耗节点modal弹窗
  isOKClick: boolean = false; // 是否点击了确定按钮
  airConditionModal: any;
  isGoBack: boolean = false;
  private toast: HTMLIonToastElement = null;
  constructor(
    private $route: ActivatedRoute,
    public navParams: NavParams,
    private loadingController: LoadingController,
    private sApp: AppService,
    private el: ElementRef,
    private service: EnergyEventsService,
    private ctrlToast: ToastController
  ) {}

  ngOnInit(): void {
    this.isSearch = false;
    this.topValue = String(Number(this.topValue) / 2) + 'px';
    if (this.sApp.config) {
      this.userId = this.sApp.config.userId;
    }

    this.getQueryParam();
    if (this.navParams.data) {
      if (this.navParams.data.energySelectNode && this.navParams.data.energySelectNode.length > 0) {
        this.selectNodeList = this.navParams.data.energySelectNode;
        this.energyId = this.selectNodeList[0].parentId;
      }
      this.airConditionModal = this.navParams.data.airConditionModal;
    } else {
      this.energyId = 0;
    }

    this.getEventEnergyNodeList();
    // 搜搜
    this.searchNameChange
      .pipe(
        debounceTime(800),
        map((e) => {
          this.energyNodeName.trim();
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
          // this.energyNodeName = res.detail.value;
          // // 调接口之前先清空数据
          // this.formartAllListData = [];
          // this.childrenList = [];
          // this.noChildrenList = [];
          // this.getEventEnergyNodeList(); // 具体需要防抖的函数
          if ((window.event ? res.keyCode : res.which) === 13) {
            res.target.blur();
          } else {
          }
        }
      });
    setTimeout(() => {
      this.listMaeginTop();
    }, 300);
    sessionStorage.removeItem('slide-up');
    window.addEventListener('setItemEvent', (e: any) => {
      if ((e.key = 'loginInfor')) {
        const _this = sessionStorage.getItem('energu-up');
        //  console.log('_this', _this);
        if (_this === 'closed') {
          this.stateShow = false;
          // sessionStorage.setItem("energu-up", 'false');
        }
      }
    });
  }
  // 失去焦点
  searchNameBlur(event: any) {
    //  console.log('失去焦点');
    // if (!this.keyCodeClick) {
    this.isSearch = true;
    // 调接口之前先清空数据
    this.formartAllListData = [];
    this.childrenList = [];
    this.noChildrenList = [];
    this.getEventEnergyNodeList(); // 具体需要防抖的函数

    setTimeout(() => {
      this.listMaeginTop();
    }, 300);
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
    this.doClose();
  }
  //关闭模态对话框
  doClose() {
    this.navParams.data.modal.dismiss({
      result: {
        closed: true,
        item: this.selectNodeList,
      },
    });
  }
  // 别表距离头部的高
  listMaeginTop() {
    const crumssHeight = this.el.nativeElement.querySelector('.ems_multiple-node-crumbs');
    let crH;
    if (crumssHeight) {
      crH = crumssHeight.offsetHeight;
    } else {
      crH = 62;
    }
    const marginTop = 44 + 56 + crH;
    this.listHeight = 'calc(100vh - ' + marginTop + 'px)';
  }
  // 能耗节点获得
  async getEventEnergyNodeList() {
    this.formartAllListData = [];
    this.childrenList = [];
    this.noChildrenList = [];
    this.loading = await this.presentLoading();
    const param = {
      name: this.energyNodeName,
      id: this.energyId,
    };
    this.service
      .getBusinessNodeTreeList(param)
      .then((data) => {
        if (data) {
          // if (!this.isSearch) {
          //   this.crumbsListData = data.selfInfo;
          // }
          this.crumbsListData = [];
          if (data.selfInfo && data.selfInfo.length === 1 && data.selfInfo[0].id === 0) {
            this.crumbsListData = data.selfInfo;
          } else {
            this.crumbsListData = [
              {
                id: 0,
                name: 'fu',
                children: true,
              },
              ...data.selfInfo,
            ];
          }
          const formatListData = data.treeList;
          const areaChildrenList = [];
          const areaNoChildren = [];
          if (formatListData && formatListData.length > 0) {
            this.noData = false;
            this.formartAllListData = formatListData;
            for (let i = 0; i < formatListData.length; i++) {
              const element = formatListData[i];
              element.checked = false;

              for (let j = 0; j < this.selectNodeList.length; j++) {
                const selectItem = this.selectNodeList[j];
                if (selectItem.key === element.key) {
                  element.checked = true;
                }
              }
              if (element.children) {
                areaChildrenList.push(element);
              } else {
                areaNoChildren.push(element);
              }
            }
            this.childrenList = areaChildrenList;
            this.noChildrenList = areaNoChildren;
          } else {
            this.stateShow = false;
            this.noData = true;
            if (this.isSearch) {
              this.noDescription = '没有搜索到您想要的信息';
            } else {
              this.noDescription = '暂无数据';
            }
            this.formartAllListData = [];
            this.childrenList = [];
            this.noChildrenList = [];
          }
        }
      })
      .catch((error) => {
        this.noData = true;
        this.noDescription = error.message;
        this.stateShow = false;
      })
      .finally(() => {
        this.loading.dismiss();
        setTimeout(() => {
          this.listMaeginTop();
        }, 300);
      });
  }
  trackById(index: number, item: any): number {
    return item.id;
  }
  // loading
  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      cssClass: 'my-area-class',
      message: ' ',
    });
    await loading.present();
    return loading;
  }
  // 面包屑返回
  backNode(item: any, index: number) {
    if (this.crumbsListData && this.crumbsListData.length > 0) {
      if (index === this.crumbsListData.length - 1) {
        return;
      }
      this.energyId = item.id;
      this.getEventEnergyNodeList();
    }
  }
  // 选中节点
  selectNode(item: any, index: number, event: any) {
    item.checked = !item.checked;
    this.dataSelect(item, '');
  }
  // 选中数据的处理
  async dataSelect(item: any, event: any) {
    if (item.checked) {
      const isIndex = lodash.findIndex(this.selectNodeList, item);

      if (isIndex < 0) {
        if (this.selectNodeList.length > 9) {
          item.checked = false;
          if (event) {
            if (event.detail) {
              event.detail.checked = false;
              event.target.checked = false;
            }
          }
          await this.presentToast('最多可选择10个节点');

          await this.toast.onDidDismiss();
        } else {
          this.selectNodeList.push(item);
        }
      }

      // if (isIndex < 0) {
      //   this.selectNodeList.push(item);
      // }
    } else {
      //  this.selectNodeList = lodash.pull(this.selectNodeList, item);
      lodash.remove(this.selectNodeList, (currentObject: any) => {
        return currentObject.key === item.key;
      });
      //  console.log(this.selectNodeList);
    }
    this.selectNodeList = lodash.uniq(this.selectNodeList);
  }
  // checked变化
  selectNodeData(item: any, index: number, event: any) {
    this.dataSelect(item, event);
  }

  // 下级节点
  subordinateNode(item: any) {
    this.energyId = item.key;
    this.getEventEnergyNodeList();
  }

  // 选择列表弹窗
  async selectModal() {
    // this.stateShow = !this.stateShow;

    if (this.stateShow) {
      this.stateShow = false;
      sessionStorage.setItem('energu-up', 'false');
      this.service.sessionStorageFunction('energu-up', 'false');
    } else {
      this.stateShow = true;
      sessionStorage.setItem('energu-up', 'true');
      this.service.sessionStorageFunction('energu-up', 'true');
    }

    setTimeout(() => {
      this.dialogHeight();
    });
  }

  // 关闭已选弹窗
  onClose() {
    this.stateShow = false;
    sessionStorage.setItem('energu-up', 'false');
    // this.sessionStorageFunction('slide-up', 'false');
    this.service.sessionStorageFunction('energu-up', 'false');
  }
  // 清空
  emptyData() {
    this.selectNodeList = [];

    if (this.formartAllListData && this.formartAllListData.length > 0) {
      lodash.forEach(this.formartAllListData, (item) => {
        item.checked = false;
      });
    }
    this.stateShow = false;
  }
  // 删除一个设备
  deleteDecive(item: any) {
    this.selectNodeList = lodash.pull(this.selectNodeList, item);
    this.selectNodeList = lodash.uniq(this.selectNodeList);
    let findData: any = lodash.find(this.formartAllListData, item);
    if (findData) {
      findData.checked = false;
    }
    item.checked = false;

    if (this.selectNodeList && this.selectNodeList.length === 0) {
      this.stateShow = false;
    }
    setTimeout(() => {
      this.dialogHeight();
    });
  }
  // 确定选中的设备
  determineSelectNode() {
    this.isOKClick = true;
    if (this.stateShow) {
      this.stateShow = false;
    }

    this.doClose();
  }
  // 搜索的查询
  isSearchOk() {
    this.isSearch = false;
    this.energyNodeName = ''; // 清空输入框
    this.formartAllListData = [];
    this.childrenList = [];
    this.noChildrenList = [];
    // console.log(this.childrenList);
    this.getEventEnergyNodeList();
  }
  dialogHeight() {
    const div = window.document.getElementsByClassName('select-device-modal-list');
    const itemList = window.document.getElementsByClassName('select-item');
    let max = 0;
    if (itemList && itemList.length > 0) {
      for (const key in itemList) {
        if (Object.prototype.hasOwnProperty.call(itemList, key)) {
          const element = itemList[key];
          const heightKey = element.clientHeight;
          if (max < heightKey) {
            max = heightKey;
          } else {
            max = max;
          }
        }
      }
    }
    div[0].setAttribute('style', 'height:' + ((this.selectNodeList.length + 1) * 90 + max) + 'px; ');
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
