import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { EMOtherWorks, EMPlanList, EMWorkItem, EMWorkTimeType } from './data-type';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppService } from '@src/app/app.service';
import { NativeService } from '../../../common/native.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-em-task-list',
  templateUrl: './em-task-list.component.html',
  styleUrls: ['./em-task-list.component.scss'],
})
export class EmTaskListComponent implements OnInit, OnChanges {
  @Input() type: 'today' | 'calendar' = 'today';

  @Input() otherWorks: EMOtherWorks = {
    count: 0,
    workList: [],
  };

  @Input() planWorks: EMPlanList = {
    count: 0,
    dailyWorks: [],
    weeklyWorks: [],
    monthlyWorks: [],
    specialWorks: [],
  };

  @Input() timeType: EMWorkTimeType;

  @Output() getImgUrl: EventEmitter<string> = new EventEmitter();

  timer$: Observable<number>;
  timerSub: Subscription;
  currentServerTime: number = null;
  agencyCssInfo: string = '';

  bigImageUrl: string = '';
  isHeaderVisible: boolean = true;
  isAgency: boolean = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private appService: AppService,
    private nativeService: NativeService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.queryParams.subscribe((param) => {
      this.agencyCssInfo = param.cssInfo;
      if (this.agencyCssInfo) {
        this.agency(this.agencyCssInfo);
      }
    });
    if (this.appService.config) {
      if (this.appService.config.moduleinfo) {
        // todo根据值触发对应的header处理方法
        let moduleInfo = this.appService.config.moduleinfo;
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          this.isAgency = true;
        }
      }
    }
  }

  ngOnInit(): void {
    // this.mockData();
    if (this.appService.config) {
      let moduleInfo = this.appService.config.moduleinfo;
      if (moduleInfo) {
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          this.isHeaderVisible = false;
        }
      } else {
        this.isHeaderVisible = true;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeType && changes.timeType.currentValue !== undefined) {
      this.renderDailyWork(changes.timeType.currentValue);
    }
  }

  trackById(index: number, item: EMWorkItem): number {
    return item.dailyWorkId;
  }

  private renderDailyWork(recordTimeType: EMWorkTimeType): void {
    if (recordTimeType !== 0) {
      this.timer$ = null;
      if (this.timerSub) {
        this.timerSub.unsubscribe();
      }
      return;
    }

    const interval = 300000; // 每隔五分钟请求服务器时间
    this.timer$ = timer(0, interval);
    this.timerSub = this.timer$
      .pipe(
        switchMap(() => {
          return Promise.resolve(new Date().getTime());
        })
      )
      .subscribe(
        (res) => {
          this.currentServerTime = res;
          this.cdr.detectChanges();
        },
        () => {
          this.timer$ = null;
          if (this.timerSub) {
            this.timerSub.unsubscribe();
          }
        },
        () => {
          this.timer$ = null;
          if (this.timerSub) {
            this.timerSub.unsubscribe();
          }
        }
      );
  }
  // 代办
  agency(cssInfo: string) {
    if (this.appService.config) {
      let moduleInfo = this.appService.config.moduleinfo;
      if (moduleInfo) {
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          this.nativeService.nativeCall(
            'changeWebViewCss',
            {
              webViewCss: cssInfo || {}, //webview样式
            },
            () => {},
            null
          );
          this.isHeaderVisible = false;
        }
      } else {
        this.isHeaderVisible = true;
      }
    }
  }
  // 图片预览
  bigImage(item: string): void {
    this.bigImageUrl = item;
    this.getImgUrl.emit(this.bigImageUrl);
  }
  bigImageMOuth(item: string): void {
    this.bigImageUrl = item;
    // console.log('Moth', this.bigImageUrl)
    this.getImgUrl.emit(this.bigImageUrl);
  }
  bigImageWeek(item: string): void {
    this.bigImageUrl = item;
    this.getImgUrl.emit(this.bigImageUrl);
  }
  bigImageTe(item: string): void {
    this.bigImageUrl = item;
    this.getImgUrl.emit(this.bigImageUrl);
  }
  // listClick(): void{
  //   this.getImgUrl.emit(this.bigImageUrl);
  // }
  // mockData(): void {
  //   this.otherWorks =  {
  //     count: 2,
  //     workList: [
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '延时完成',
  //         dailyWorkId: 141,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: null,
  //         workStatus: 1,
  //         timeBegin: null,
  //         finishedTime: '16:03',
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '延时完成',
  //         dailyWorkId: 142,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: null,
  //         workStatus: 1,
  //         timeBegin: null,
  //         finishedTime: '16:03',
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       }
  //     ]
  //   };

  //   this.planWorks = {
  //     count: 3,
  //     dailyWorks: [
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '按时完成',
  //         dailyWorkId: 1342,
  //         remarks: '测试一下',
  //         attach: null,
  //         timeEnd: '9:00',
  //         workStatus: 1,
  //         timeBegin: '8:00',
  //         finishedTime: '9:03',
  //         attachList: ['https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg'],
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '延时完成',
  //         dailyWorkId: 12322,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: '11:00',
  //         workStatus: 2,
  //         timeBegin: '10:00',
  //         finishedTime: '12:03',
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '未完成',
  //         dailyWorkId: 122324,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: '18:30',
  //         workStatus: 0,
  //         timeBegin: '14:00',
  //         finishedTime: null,
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '未完成',
  //         dailyWorkId: 12234,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: '16:30',
  //         workStatus: 0,
  //         timeBegin: '16:00',
  //         finishedTime: null,
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //     ],
  //     weeklyWorks: [],
  //     monthlyWorks: [],
  //     specialWorks: [
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '按时完成',
  //         dailyWorkId: 141,
  //         remarks: '测试一下',
  //         attach: null,
  //         timeEnd: null,
  //         workStatus: 1,
  //         timeBegin: null,
  //         finishedTime: '16:03',
  //         attachList: ['https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg',
  //           'https://img2.baidu.com/it/u=2394693472,3854538257&fm=26&fmt=auto&gp=0.jpg'],
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '未完成',
  //         dailyWorkId: 1222,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: null,
  //         workStatus: 2,
  //         timeBegin: null,
  //         finishedTime: '16:03',
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //       {
  //         description: '每月一次（大概）对机房进行预防式检查',
  //         status: '未完成',
  //         dailyWorkId: 1223,
  //         remarks: null,
  //         attach: null,
  //         timeEnd: null,
  //         workStatus: 0,
  //         timeBegin: null,
  //         finishedTime: '16:03',
  //         attachList: null,
  //         createdTime: '2021-04-15 16:03:41',
  //         measureName: '定期检查机房',
  //         measureCode: 'CSK20210415006c',
  //         timeRange: null,
  //         executionCycle: 6
  //       },
  //     ]
  //   };
  // }
}
