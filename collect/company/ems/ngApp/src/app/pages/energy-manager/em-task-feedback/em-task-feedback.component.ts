import { EnergyManagerService } from '../energy-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'ng-zorro-antd-mobile';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ITaskFeedBackParam, ITaskFeedBackInfo, ITaskFeedBackData, upladImageType } from './em-task-feedback.interface';
import { AppService } from '@src/app/app.service';
import { NativeService } from '../../../common/native.service';
import { BrowserStack } from 'protractor/built/driverProviders';

@Component({
  selector: 'app-em-task-feedback',
  templateUrl: './em-task-feedback.component.html',
  styleUrls: ['./em-task-feedback.component.scss'],
})
export class EmTaskFeedbackComponent implements OnInit {
  workDetail!: ITaskFeedBackInfo;
  animating: boolean = false;
  remarks: string = '';
  attachList: upladImageType[] = [];
  isItOpen: boolean = false;
  actionSheet: any;
  private isCommitting = false;
  relatedFunc: any = {
    value: '',
    label: '',
  };
  constructor(
    private _toast: ToastService,
    private $route: ActivatedRoute,
    private $router: Router,
    private service: EnergyManagerService,
    private appService: AppService,
    private nativeService: NativeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // 通过路由获取
    this.$route.queryParams.subscribe((param) => {
      let feedbackParam = sessionStorage.getItem('feedbackParam');
      this.workDetail = JSON.parse(feedbackParam) as ITaskFeedBackInfo;
      const relatedFuncValue = feedbackParam ? JSON.parse(feedbackParam).relatedFunc : null;
      let relatedFuncLabel = '';
      switch (+relatedFuncValue) {
        case 1:
          // relatedFuncLabel = '能耗分析';
          relatedFuncLabel = '';
          break;
        case 2:
          // relatedFuncLabel = '能耗纵览';
          relatedFuncLabel = '';
          break;
        case 3:
          // relatedFuncLabel = 'KPI管理';
          relatedFuncLabel = '';
          break;
        case 4:
          relatedFuncLabel = '能耗告警';
          break;
        case 5:
          relatedFuncLabel = '人工录入';
          break;
        default:
          relatedFuncLabel = '';
      }
      this.relatedFunc = {
        value: +relatedFuncValue,
        label: relatedFuncLabel,
      };
      //  console.log('param', feedbackParam, param, this.relatedFunc);
    });
    this.agency();
  }

  back(param?: any) {
    if (!param) {
      param = {};
    }
    param.cssInfo = null;
    // 代办返回列表的参数
    if (this.appService.config) {
      let moduleInfo = this.appService.config.moduleinfo;
      if (moduleInfo) {
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          param.cssInfo = JSON.stringify(moduleInfo.cssInfo) || null;
        }
      }
    }
    // 拍照弹窗是否关闭
    if (this.isItOpen) {
      this.isItOpen = false;
      this.recordPopUpClose();
    } else {
      this.$router.navigate(['/energyManager'], {
        queryParams: param,
      });
    }
    this.cdr.detectChanges();
  }
  imageClick(item: any) {
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
  speechChangeDetail(words: string) {
    this.remarks = words;
  }

  showToast(info: string, callback?: () => void | undefined) {
    this._toast.info(info, 2000, callback, true);
  }

  async commit() {
    // console.count('提交次数');
    if (this.isCommitting) {
      return;
    }
    this.isCommitting = true;

    let fileList: number[] = [];
    this.attachList?.map((item) => {
      fileList.push(item.fileId);
    });
    let param: ITaskFeedBackParam = {
      dailyWorkId: this.workDetail.dailyWorkId,
      remarks: this.remarks,
      attachList: fileList,
    };
    this.service
      .finishDailyWork(param)
      .then((data) => {
        console.log('任务反馈完成');
        this.showToast('任务反馈完成', () => {
          this.back(data);
        });
      })
      .catch((error) => {
        this.showToast(`${error}`);
      })
      .finally(() => {
        this.isCommitting = false;
      });
  }
  // 代办
  agency() {
    if (this.appService.config) {
      let moduleInfo = this.appService.config.moduleinfo;
      // console.log(moduleInfo);
      if (moduleInfo) {
        moduleInfo = JSON.parse(moduleInfo);
        // console.log(moduleInfo);
        //  console.log(moduleInfo.isFromTodo);
        if (moduleInfo.isFromTodo === '1') {
          this.nativeService.nativeCall(
            'changeWebViewCss',
            {
              webViewCss: '{}', //webview样式
            },
            () => {
              console.log('success');
            },
            () => {},
          );
        }
      } else {
      }
    }
  }
  // 跳转
  relateLink() {
    //   console.log(this.relatedFunc);
    let itemCome;
    if (this.relatedFunc) {
      switch (this.relatedFunc.value) {
        case 1:
          itemCome = '502';
          break;
        case 2:
          itemCome = '523';
          break;
        case 3:
          itemCome = '503';
          break;
        case 4:
          itemCome = '504';
          break;
        case 5:
          itemCome = '5300';
          break;
        default:
      }
      window.location.href = `/apphtml/index.htm?itemCode=` + itemCome;
    }
  }
}
