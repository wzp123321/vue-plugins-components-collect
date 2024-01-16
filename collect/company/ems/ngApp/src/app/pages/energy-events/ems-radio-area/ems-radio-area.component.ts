import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavParams } from '@ionic/angular';
import { NativeService } from '@src/app/common/native.service';
import { Subject } from 'rxjs';
import { EnergyEventsService } from '../energy-events.service';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { AppService } from '@src/app/app.service';
import * as lodash from 'lodash';

@Component({
  selector: 'app-ems-radio-area',
  templateUrl: './ems-radio-area.component.html',
  styleUrls: ['./ems-radio-area.component.scss'],
})
export class EmsRadioAreaComponent implements OnInit, OnChanges {
  isEnergyManager: boolean = false;
  @Output() goBackLink = new EventEmitter();
  areaName: string = ''; //搜索区域名字
  areaId: number = 0;
  userId: string = '';
  crumbsListData: any = [];
  areaListData: any = [];
  destroy = new Subject();
  searchNameChange = new Subject();
  loading: any;
  listHeight: string = '';
  areaAllListData: any = [];
  childrenList: any = [];
  noChildrenList: any = [];
  selectNodeId: number;
  selectNodeList: any;

  isSearch: boolean = false; // 是否是搜索
  noData: boolean = false;
  topValue: string = 'calc(100% - 159px)';
  noDescription: string = '';

  constructor(
    private $route: ActivatedRoute,
    private $router: Router,
    private sNative: NativeService,
    public navParams: NavParams,
    private service: EnergyEventsService,
    private loadingController: LoadingController,
    private sApp: AppService,
    private el: ElementRef
  ) {}

  async ngOnInit() {
    this.isSearch = false;
    this.topValue = String(Number(this.topValue) / 2) + 'px';
    if (this.sApp.config) {
      this.userId = this.sApp.config.userId;
    }

    this.getQueryParam();
    if (this.navParams.data) {
      const areaId = this.navParams.data.areaId;
      if (areaId) {
        this.areaId = areaId;
      } else {
        this.areaId = 0;
      }
      const selectId = this.navParams.data.childrenSelectId;
      if (selectId) {
        this.selectNodeId = selectId;
      }
    } else {
      this.areaId = 0;
    }

    this.getEventTypeInfoList();
    // 搜搜
    this.searchNameChange
      .pipe(
        debounceTime(800),
        map((e) => {
          this.areaName.trim();
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
          // this.areaName = res.detail.value;
          // this.getEventTypeInfoList(); // 具体需要防抖的函数
          if ((window.event ? res.keyCode : res.which) === 13) {
            res.target.blur();
          } else {
          }
        }
      });
    setTimeout(() => {
      this.listMaeginTop();
    }, 300);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isGoBack) {
      const currentValue = changes.isGoBack.currentValue;
      if (currentValue) {
      }
    }
  }
  // 失去焦点
  searchNameBlur(event: any) {
    //console.log('失去焦点');
    // if (!this.keyCodeClick) {
    this.isSearch = true;
    this.getEventTypeInfoList(); // 具体需要防抖的函数

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

  // 搜索
  inputSearch(item: any) {
    // this.areaName = item.detail.value;
    // this.areaId = 0;
    // this.getEventTypeInfoList();
    // console.log('inputSearch. item', item.detail.value);
  }

  // 别表距离头部的高
  listMaeginTop() {
    const crumssHeight = this.el.nativeElement.querySelector('.ems_radio-area-crumbs');
    let crH;
    if (crumssHeight) {
      crH = crumssHeight.offsetHeight;
    } else {
      crH = 62;
    }
    const marginTop = 44 + 56 + crH;
    this.listHeight = 'calc(100vh - ' + marginTop + 'px)';
  }

  // 能源事件类型下拉列表
  async getEventTypeInfoList() {
    this.loading = await this.presentLoading();
    const param = {
      areaName: this.areaName,
      areaId: this.areaId,
      yardCodes: '',
    };
    this.service
      .getDropdownAntTreeList(param)
      .then((data) => {
        if (data) {
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

          console.log(this.crumbsListData);
          const areaListData = data.treeList;
          // const areaListData: {[key: string]: any} = [
          //   {
          //     title  : '三甲医院',
          //     key : 1,
          //     children: true,
          //     parentId : 1
          //   },
          //   {
          //     title  : '选项一超多超多超多超多超多超多超多超多超多文字',
          //     key : 2,
          //     children: true,
          //     parentId : 1
          //   },
          //   {
          //     title  : '选项一超多超多超多超多超多超多超多超多超多文字',
          //     key : 3,
          //     children: true,
          //     parentId : 1
          //   }
          // ]
          const areaChildrenList = [];
          const areaNoChildren = [];
          if (areaListData && areaListData.length > 0) {
            this.noData = false;
            this.areaAllListData = areaListData;
            for (let i = 0; i < areaListData.length; i++) {
              const element = areaListData[i];
              element.checked = false;
              if (this.selectNodeId === element.key) {
                element.checked = true;
                element.classSelect = 'selectNodeDiv';
                this.selectNodeList = element;
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
            this.noData = true;
            if (this.isSearch) {
              this.noDescription = '没有搜索到您想要的信息';
            } else {
              this.noDescription = '暂无数据';
            }
          }
          this.listMaeginTop();
          setTimeout(() => {
            this.selectScroll('.modal-content', '.selectNodeDiv');
          }, 100);
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
  // 选中的值点击进入定位到位置
  selectScroll(parentDom: any, dom: any) {
    const meauresContent = this.el.nativeElement.querySelector(parentDom);
    const nameInput = this.el.nativeElement.querySelector(dom);
    if (nameInput) {
      const exeDivTop = nameInput.offsetTop;
      meauresContent?.scrollToPoint(0, exeDivTop);
    }
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
  // 错误提示框
  async presentLoadingWithOptions(text: string) {
    this.loading = await this.loadingController.create({
      duration: 600,
      message: text,
      cssClass: 'custom-class custom-loading',
      backdropDismiss: false,
      showBackdrop: false,
      spinner: null,
      translucent: false,
    });
    return await this.loading.present();
  }

  // 面包屑返回
  backNode(item: any, index: number) {
    if (this.crumbsListData && this.crumbsListData.length > 0) {
      if (index === this.crumbsListData.length - 1) {
        return;
      }
      this.areaId = item.id;
      this.getEventTypeInfoList();
    }
  }
  // 选中节点
  selectNode(item: any) {
    for (let i = 0; i < this.areaAllListData.length; i++) {
      const element = this.areaAllListData[i];
      if (item.key === element.key) {
        item.checked = true;
        // if (this.crumbsListData && this.crumbsListData.length > 0) {
        //    for (let i = 0; i < this.crumbsListData.length; i++) {
        //      const element = this.crumbsListData[i];
        //      if (element.parentId === item.parentId) {
        //       lodash.pull(this.crumbsListData, element);
        //      }
        //    }
        // }
        // this.crumbsListData.push({
        //   name: item.title,
        //   id: item.key,
        //   children: item.children,
        //   parentId : item.parentId
        // });
        this.navParams.data.modal.dismiss({
          result: {
            closed: true,
            item: item,
          },
        });
        this.selectNodeList = item;
      } else {
        element.checked = false;
      }
    }
    this.crumbsListData = lodash.uniq(this.crumbsListData);
  }
  subordinateNode(item: any) {
    // this.crumbsListData.push({
    //   name: item.title,
    //   id: item.key,
    //   children: item.children,
    //   parentId : item.parentId
    // });
    // this.crumbsListData = lodash.uniq(this.crumbsListData);
    this.areaId = item.key;
    this.getEventTypeInfoList();
  }
}
