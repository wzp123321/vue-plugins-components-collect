import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EMOtherWorks, EMPlanList } from './em-task-list/data-type';
import {
  CCalendarWork,
  CTodayWork,
  EMWorkTimeType,
} from './ems-calendar/ems-calendar.api';
import { NativeService } from 'src/app/common/native.service';
import { AppService } from '@src/app/app.service';
import { filter, map, throttleTime } from 'rxjs/operators';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';
import { Router } from '@angular/router';

@Component({
  selector: 'app-energy-manager',
  templateUrl: './energy-manager.component.html',
  styleUrls: ['./energy-manager.component.scss'],
})
export class EnergyManagerComponent implements OnInit, OnDestroy {
  isHeaderVisible: boolean = true;
  day: number = null;

  calendarType: 'today' | 'calendar' = 'today';
  calendarCollapse: number = null;
  isTop: boolean = true;
  canScroll: boolean = true;
  scrollTimeout: NodeJS.Timeout = null;

  timeType: EMWorkTimeType = 0;
  otherWorks: EMOtherWorks = { count: 0, workList: [] };
  planWorks: EMPlanList = {
    count: 0,
    dailyWorks: [],
    weeklyWorks: [],
    monthlyWorks: [],
    specialWorks: [],
  };

  isItAgent: boolean = false; // 是否是代办

  bigImageUrl: string = '';
  EventsRoute = '/energyEvents/newEvents';
  private whenHeaderResize: ResizeObserver = null;
  onContentScroll: EventEmitter<any> = new EventEmitter<any>();
  onContentTouch: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private sNative: NativeService,
    private sApp: AppService,
    private cdr: ChangeDetectorRef,
    private $router: Router,
  ) {}

  ngOnInit(): void {
    this.sNative.registerHandler('goBack', () => {
      this.goBack();
    });

    if (this.sApp.config) {
      if (this.sApp.config.moduleinfo) {
        // todo根据值触发对应的header处理方法
        let moduleInfo = this.sApp.config.moduleinfo;
        moduleInfo = JSON.parse(moduleInfo);
        if (moduleInfo.isFromTodo === '1') {
          this.isHeaderVisible = false;
        }
      }
    }

    if (this.isHeaderVisible) {
      let scrollTop: number = 0;
      let headerHeight: number = 0;

      // 监听Header高度变化，并实时改变Content高度
      this.whenHeaderResize = new ResizeObserver(
        (entries: ResizeObserverEntry[]) => {
          if (entries.length) {
            const rect = entries[0].contentRect;
            const content = document.querySelector('ion-content');
            content.style.setProperty('--header-height', `${rect.height}px`);
            const change = rect.height - headerHeight;
            headerHeight = rect.height;
            if (scrollTop && 'calendar' === this.calendarType) {
              content.scrollToPoint(0, scrollTop + change);
            }
          }
        }
      );
      this.whenHeaderResize.observe(document.querySelector('ion-header'));

      // 监听Content滚动事件，判断是否触顶
      this.onContentScroll
        .pipe(
          map((v: CustomEvent) => {
            return v.detail.scrollTop;
          })
        )
        .subscribe((v: number) => {
          scrollTop = v;
          this.isTop = v <= 1;
        });

      // 监听Content滑动事件，并按需自动折叠/展开日历
      this.onContentTouch
        .pipe(
          filter((v: number) => 0 < Math.abs(v)),
          throttleTime(33)
        )
        .subscribe((v: number) => {
          if (this.isTop) {
            this.calendarCollapse = 1 / v;
          } else {
            this.calendarCollapse = v;
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.isHeaderVisible) {
      this.whenHeaderResize.disconnect();
      this.onContentScroll.unsubscribe();
      this.onContentTouch.unsubscribe();
    }
  }

  goBack(): void {
    console.log('this.bigImageUrl', this.bigImageUrl);
    if (this.bigImageUrl) {
      this.bigImageUrl = '';
      console.log(this.bigImageUrl);
    } else {
      this.sNative.nativeCall('goback', { pageHome: 1 }, null, null);
    }
    this.cdr.detectChanges();
  }

  setCalendarType(type: 'today' | 'calendar'): void {
    this.calendarType = type;
  }

  todaySelected(today: CTodayWork): void {
    if (today) {
      this.day = today.day;
      this.timeType = today.mark;
      this.otherWorks = today.data.otherWorks;
      this.planWorks = today.data.planWorks;
    }
  }

  dateSelected(day: CCalendarWork): void {
    if (day) {
      this.timeType = day.mark;
      this.otherWorks = day.data.otherWorks;
      this.planWorks = day.data.planWorks;
    }
  }

  preventScroll(flag: boolean): void {
    if (flag) {
      this.canScroll = false;
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => {
        this.canScroll = true;
      }, 233);
    }
  }

  // 图片预览
  bigImage(item: string): void {
    this.bigImageUrl = item;
  }
  isShowHiden(item: boolean): void {
    this.bigImageUrl = '';
  }

  linkEvents() {
    this.$router.navigate([this.EventsRoute], {
      queryParams: {
        isEnergyManager: true, 
      } 
    } )
  }
}
