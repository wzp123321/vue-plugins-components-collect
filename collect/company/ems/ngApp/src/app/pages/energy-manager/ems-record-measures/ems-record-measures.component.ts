import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
  ɵɵtrustConstantResourceUrl,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  executionCycleData,
  measureStatusData,
  photographData,
  systemData,
  relatedFuncData,
} from './record-measures-data-types';
import { EnergyManagerService } from '../energy-manager.service';
import {
  ActionSheetController,
  LoadingController,
  ViewDidEnter,
  ViewWillLeave,
} from '@ionic/angular';
import { NativeService } from '../../../common/native.service';
import { NavController } from '@ionic/angular';
import { ToastService } from 'ng-zorro-antd-mobile';
import { zip } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-ems-record-measures',
  templateUrl: './ems-record-measures.component.html',
  styleUrls: ['./ems-record-measures.component.scss'],
})
export class EmsRecordMeasuresComponent
  implements OnInit, OnDestroy, ViewDidEnter
{
  recordRuleRoute = '/energyManager';
  executionCycleList: any = executionCycleData; // 建议执行周期列表
  measureStatusList: any = measureStatusData; // 状态列表
  detailMeasure: string = null; // 措施详情
  photographList: any = photographData;
  measureName: string = null; // 措施名称
  executionCycle: number = null; // 执行周期
  executionCycleName: string = '';
  lableTip: string = '选择';
  measureStatus: number = measureStatusData[0].value; // 状态
  measureStatusName: string = measureStatusData[0].label;
  measureNamError: boolean = false; // 措施名称
  executionCycleError: boolean = false; // 执行周期
  measureStatusError: boolean = false; // 状态
  scrollTop: number = 0; // 滚动条的高
  loading: any;
  tooltipText: string = ''; // 提示信息
  pop: boolean = false;
  isItPop: boolean = false;
  isRecordShow: any = null;
  actionSheet: any;
  actionSheet2: any = null;
  buttonClass: any = []; // 样式
  showButtonList: any = [];
  dataList: any = [];
  measureLableTip: string;
  clickName: string; // 点击名称
  isAddMeasure: boolean = false;

  systemId: number = null; // 系统
  systemName: string = ''; // 系统名
  systemList: any = systemData; // 建议执行周期列表
  systemError: boolean = false;

  relatedFuncList: any = relatedFuncData; // 关联功能
  relatedFunc: number = null; // 关联功能
  relatedFuncName: string = ''; // 关联功能
  relatedFuncError: boolean = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private energyManagerService: EnergyManagerService,
    private el: ElementRef,
    private loadingController: LoadingController,
    private nativeService: NativeService,
    private navCont: NavController,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    public actionSheetController: ActionSheetController
  ) {}

  async ngOnInit(): Promise<void> {
    // 物理键返回监听事件
    // this.nativeService.registerHandler("goBack",  () => {
    //   this.router.navigate([this.recordRuleRoute], {});
    // });
    // const loading =  await this.presentLoading() ;
    if (this.measureStatusName) {
      this.measureLableTip = '更改';
    } else {
      this.measureLableTip = '选择';
    }
    //  loading.dismiss();
  }
  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: ' ',
    });
    await loading.present();
    return loading;
  }
  ngOnDestroy() {
    this.goBack();
  }

  ionViewDidEnter(): void {}

  showPOP(e: any) {
    this.pop = e;
  }
  // 返回
  goBack(isItPop?: boolean) {
    if (this.isRecordShow) {
      this.recordPopUpClose();
    } else {
      this.router.navigate([this.recordRuleRoute], {
        queryParams: {
          isAddMeasure: this.isAddMeasure,
        },
      });
    }
    this.cdr.detectChanges();
  }
  filterStr(str: string) {
    // let pattern = new RegExp('[`~!@#$^&*()=|{}\':;\',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？%+_]');
    let pattern = new RegExp(
      '[：；;/?:@&=+$,，#！!#%^*()_+{}:""<>?？“：”【】|+——（）*&……%￥#@！《》、·~`/\\[\\]/.""‘’。，‘’\\\\-]'
    );

    let specialStr = '';
    // for (let i = 0; i < str.length; i++) {

    //     specialStr += str.substr(i, 1).replace(pattern, '');

    // }
    const u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

    if (isAndroid) {
      const regRule =
        /[^\u4E00-\u9FA5|\d|\a-zA-Z|\r\n,.?!，。？！…—&$=()《》【】~！@#￥%……&*（）——+|{}”：；‘’“:;.,、\'+==+/*{}[\]]/g;
      specialStr = str.replace(regRule, '');
    }
    if (isiOS) {
      const regRule =
        /[^\u4E00-\u9FA5|\d|\a-zA-Z|\r\n,.?!，。？！…—&$=()《》【】~！@#￥%……&*（）——+|{}”：“；‘’;:.,、\'+==+/*{}[\]]/g;
      specialStr = str.replace(regRule, '');
    }
    // console.log('specialStr==', specialStr);
    return specialStr;
  }
  mNameChange(item: any) {
    // const curr = this.filterStr(item.detail.value);
    // if (curr) {
    //   this.measureNamError = false;
    // }
    // this.measureName = curr;
    // const h = this.el.nativeElement.querySelector('#measureNameID');
    // if (h) {
    //   h.value = curr;
    // }
  }

  mNameKeyUp(e: any) {
    const curr = this.filterStr(e);
    if (curr) {
      this.measureNamError = false;
    }
    this.measureName = curr;

    const h = this.el.nativeElement.querySelector('#measureNameID');
    if (h) {
      h.value = curr;
    }
    // console.log('keuUP===', this.measureName);
  }
  measureNameBlur(item: any) {
    let inputValue;
    if (this.measureName) {
      inputValue = this.measureName.replace(/\'|/g, '');
      const h = this.el.nativeElement.querySelector('#measureNameID');
      if (h) {
        h.value = inputValue;
      }
    }

    this.measureName = inputValue;
  }
  async recordPopUp(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.recordPopUpClose();
    // this.dataList = [];
    this.clickName = 'record';
    //this.executionCycleList  // 建议执行周期列表
    this.recordPopUpFunc2(this.getHandleData(this.executionCycleList));
  }
  // 状态
  async measureStatusClick(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.clickName = 'status';
    this.recordPopUpFunc2(this.getHandleData(this.measureStatusList));
  }
  // 建议执行周期选择
  butonChange(e: any) {
    if (e === 'show') {
      this.isItPop = true;
    } else {
      this.isItPop = false;
    }
    if (e.value) {
      this.executionCycleError = false;
    }
    this.executionCycle = e.value;
    this.executionCycleName = e.label;
    if (this.executionCycleName) {
      this.lableTip = '更改';
    }
  }
  // 状态选择
  measureStatusChange(item: any) {
    if (item === 'show') {
      this.isItPop = true;
    } else {
      this.isItPop = false;
    }
    // console.log(',show==' ,this.isItPop)
    if (item.value) {
      this.measureStatusError = false;
    }
    this.measureStatus = item.value;
  }

  // 措施描述详情
  speechChangeDetail(item: string) {
    this.detailMeasure = item;
  }
  divScrolling(e: any) {
    this.scrollTop = e.detail.scrollTop;
  }
  // 获得参数
  getMeasureParam() {
    const param = {
      measureName: this.measureName,
      executionCycle: this.executionCycle,
      measureStatus: this.measureStatus,
      description: this.detailMeasure,
      systemId: this.systemId,
      relatedFunc: this.relatedFunc,
    };
    return param;
  }
  // 验证
  public verificationParam(param: any): boolean {
    if (!param.measureName) {
      this.measureNamError = true;
      return false;
    } else {
      this.measureNamError = false;
    }
    if (!param.systemId) {
      this.systemError = true;
      return false;
    } else {
      this.systemError = false;
    }
    if (!param.executionCycle) {
      this.executionCycleError = true;
      return false;
    } else {
      this.executionCycleError = false;
    }
    if (!param.measureStatus) {
      this.measureStatusError = true;
      return false;
    } else {
      this.measureStatusError = false;
    }

    return true;
  }
  async saveRecordMeasures() {
    const param = this.getMeasureParam();
    const flag = this.verificationParam(param);
    if (flag) {
      try {
        await this.energyManagerService.addMeasure(param);
        this.showToast('新增措施记录成功', () => {
          this.isAddMeasure = true;
          this.router.navigate([this.recordRuleRoute], {
            queryParams: {
              isAddMeasure: this.isAddMeasure,
            },
          });
        });

        // this.navCont.navigateBack([this.recordRuleRoute],{
        //   queryParams:{
        //     'isAddMeasure':true
        //   }
        // })
        //  this.navCont.navigateBack([{isAddMeasure: true}]);
      } catch (error) {
        this.toastService.show((error as any)?.message, 2000);
      }
    } else {
      if (this.measureNamError) {
        this.errorScroll('.meaures-content', '.label-input');
      }
      if (this.executionCycleError) {
        this.errorScroll('.meaures-content', '.executionCycleList-div');
      }
      if (this.measureStatusError) {
        this.errorScroll('.meaures-content', '.measureStatusList-div');
      }

      this.presentLoadingWithOptions('请填写必填项');
    }
  }
  // 错误提示滚动位置
  errorScroll(parentDom: any, dom: any) {
    const meauresContent = this.el.nativeElement.querySelector(parentDom);
    const nameInput = this.el.nativeElement.querySelector(dom);
    const exeDivTop = nameInput.offsetTop;
    const newScroll = Number(this.scrollTop - exeDivTop);
    meauresContent.scrollToPoint(0, exeDivTop - 32);
    // window.scrollTo({
    //   top:  exeDivTop - 32,
    //   behavior: 'smooth'
    // })
    //   document.querySelector(parentDom).scrollTop(0 , exeDivTop - 32)

    //   console.log(meauresContent.scrollTo)
    //   document.getElementsByName(parentDom)[0].scrollTop = exeDivTop - 32;
    //  $ionicScrollDelegate.$getByHandle('small').scrollTo(0,1000);
    // meauresContent.scrollTop = 1;
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
  showToast(info: string, callback?: () => void | undefined) {
    this.toastService.info(info, 2000, callback, true);
  }
  // 底部
  async recordPopUpFunc2(v: any) {
    this.actionSheet2 = await this.actionSheetController.create({
      cssClass: v.buttonClass,
      buttons: v.showButtonList,
      mode: 'md',
    });
    await this.actionSheet2.present();
    // 监听是否点击遮罩层
    this.actionSheet2.onDidDismiss().then(() => {
      this.ionActionSheetDidDismiss();
    });
    this.isRecordShow = this.actionSheet2;
  }
  // 关闭底部
  async recordPopUpClose() {
    if (this.actionSheet2) {
      await this.actionSheet2.dismiss();
    }
    this.isRecordShow = null;
    console.log('this.isRecordShow', this.isRecordShow);
  }
  // 数据处理
  getHandleData(data: any) {
    let buttonClass = [];
    let showButtonList = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item.type) {
          item.type = 'summit';
        }
        buttonClass.push(item.type);
        showButtonList.push({
          text: item.label,
          role: item.type,
          handler: () => {
            if (item.type !== 'cancel') {
              this.showData(item);
            }
            this.isRecordShow = null;
            //  this.implementChange.emit(item);
          },
        });
      }
    }
    return {
      buttonClass,
      showButtonList,
    };
  }
  // 操作
  showData(item: any) {
    if (this.clickName === 'record') {
      this.executionCycleName = item.label;
      if (item.label) {
        this.lableTip = '更改';
      } else {
        this.lableTip = '选择';
      }

      if (item.value) {
        this.executionCycleError = false;
      }
      this.executionCycle = item.value;
    } else if (this.clickName === 'system') {
      this.systemId = item.value;
      this.systemName = item.label;
      if (item.value) {
        this.systemError = false;
      }
    } else if (this.clickName === 'status') {
      this.measureStatusName = item.label;
      if (item.label) {
        this.measureLableTip = '更改';
      } else {
        this.measureLableTip = '选择';
      }
      if (item.value) {
        this.measureStatusError = false;
      }
      this.measureStatus = item.value;
    } else if (this.clickName === 'relatedFun') {
      this.relatedFunc = item.value;
      this.relatedFuncName = item.label;
      if (item.value) {
        this.relatedFuncError = false;
      }
    }
    this.isRecordShow = null;
  }
  ionActionSheetDidDismiss() {
    this.isRecordShow = null;
  }

  // 系统选择
  systemChange(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.recordPopUpClose();
    this.clickName = 'system';
    this.recordPopUpFunc2(this.getHandleData(this.systemList));
  }

  //  关联功能
  relatedFuncChange(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.clickName = 'relatedFun';
    this.recordPopUpFunc2(this.getHandleData(this.relatedFuncList));
  }
}
