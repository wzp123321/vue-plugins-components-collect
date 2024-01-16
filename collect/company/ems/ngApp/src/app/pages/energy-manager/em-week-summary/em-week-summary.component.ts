import { EnergyManagerService } from '../energy-manager.service';
import { NativeService } from 'src/app/common/native.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IWeekSummaryData } from './em-week-summary.interface.ts';
import { IonInfiniteScroll } from '@ionic/angular';
import { timer } from 'rxjs';

@Component({
  selector: 'app-em-week-summary',
  templateUrl: './em-week-summary.component.html',
  styleUrls: ['./em-week-summary.component.scss'],
})
export class EmWeekSummaryComponent implements OnInit {
  index: number = 0;
  size: number = 5;
  list: IWeekSummaryData[] = [];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  isOpen: boolean = false;
  selectItem: IWeekSummaryData = {
    id: 0,
    comment: '',
    taskCount: 0,
    lastTime: '', // yyyy-MM-dd hh:mm:ss
    serviceDays: 0,
    beginTime: '', // yyyy-MM-dd
    endTime: '', // yyyy-MM-dd
    createdTime: '', // yyyy-MM-dd hh:mm:ss
  };

  constructor(
    private nativeService: NativeService,
    private service: EnergyManagerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  loadData(event: any) {
    // console.log('-----------infinite');
    this.getWeeklyReportList(() => {
      event.target.disabled = true;
    }, event);
  }

  getWeeklyReportList(callback: any, event?: any) {
    this.service
      .getWeeklyReportList(++this.index, this.size)
      .then((data: IWeekSummaryData[]) => {
        data.reverse();
        this.list.unshift(...data);

        if (data.length < this.size) {
          callback();
          // 初始化滚动到最底部
          if (this.index === 1) {
            timer(100).subscribe((_) => {
              if (document.querySelector('ion-content')) {
                document.querySelector('ion-content').scrollToBottom(0);
              }
            });
          }
        }
        event && event.target.complete();
      })
      .catch((error) => {
        console.log('获取一周小结列表失败', error);
        event && event.target.complete();
        callback();
      });
  }

  share(item: IWeekSummaryData) {
    this.selectItem = item;
    this.isOpen = true;
  }

  exitApp() {
    // console.log(this.isOpen);
    if (this.isOpen) {
      this.isOpen = false;
      this.cdr.detectChanges();
      return;
    }
    this.nativeService.nativeCall(
      'goback',
      {
        pageHome: 1,
      },
      null,
      (error: any) => console.log(error)
    );
  }
}
