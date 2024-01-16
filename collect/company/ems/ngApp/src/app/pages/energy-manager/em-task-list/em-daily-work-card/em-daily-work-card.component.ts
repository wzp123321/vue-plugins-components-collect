import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EMCheckStatus, EMWorkItem, EMWorkTimeType } from '../data-type';
import { getHours, getMinutes } from 'date-fns';
import { Router } from '@angular/router';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';

@Component({
  selector: 'app-em-daily-work-card',
  templateUrl: './em-daily-work-card.component.html',
  styleUrls: ['./em-daily-work-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmDailyWorkCardComponent implements OnInit, AfterViewInit {
  @Input() type: 'today' | 'calendar' = 'today';
  @Input() dailyWorkData: EMWorkItem | null = null;
  @Input() timeType: EMWorkTimeType = 0;
  @Input() currentServerTime: number;
  @Input() isLastCard = false;
  @Output() imageClick = new EventEmitter();
  showDetail = false;
  canDescriptionFolded: boolean = false;
  isDescriptionFolded: boolean = true;
  originElement: HTMLDivElement = null;
  clampElement: HTMLDivElement = null;
  descriptionElement: Element = null;

  private readonly HISTORY_WORK_STATUS_MAP: { [key: number]: string } = {
    0: 'undone',
    1: 'done',
    2: 'delay',
  };

  private readonly TODAY_WORK_STATUS_MAP: { [key: number]: string } = {
    0: 'todo',
    1: 'done',
    2: 'delay',
  };

  get checkStatus(): EMCheckStatus {
    //  console.log('dailyWorkData===', this.dailyWorkData);

    if (this.dailyWorkData === null) {
      return null;
    }
    const statusTyle = +this.dailyWorkData.status;
    if (this.timeType === 1) {
      return 'todo';
    }
    if (this.timeType === -1) {
      return this.HISTORY_WORK_STATUS_MAP[statusTyle] as EMCheckStatus;
    }

    if (this.timeType === 0) {
      const style = this.TODAY_WORK_STATUS_MAP[statusTyle] as EMCheckStatus;
      return style;
    }

    return null;
  }

  get isWorkInProgress(): boolean {
    if (this.timeType !== 0 || this.currentServerTime === null) {
      return false;
    }

    const { beginTime, endTime } = this.dailyWorkData;
    const serverTimeHours = getHours(this.currentServerTime);
    const serverTimeMinutes = getMinutes(this.currentServerTime);
    const isAfterStartTime = this.isAfterStartTime(
      serverTimeHours,
      serverTimeMinutes,
      beginTime
    );
    const isBeforeEndTime = this.isBeforeEndTime(
      serverTimeHours,
      serverTimeMinutes,
      endTime
    );

    return isBeforeEndTime && isAfterStartTime;
  }

  constructor(
    private router: Router,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.dailyWorkData.description) {
      this.originElement =
        this.el.nativeElement.getElementsByClassName('origin')[0];
      this.clampElement =
        this.el.nativeElement.getElementsByClassName('clamp')[0];
      this.descriptionElement =
        this.clampElement.getElementsByClassName('origin-text')[0];
      this.clampElement.setAttribute(
        'origin-text',
        this.dailyWorkData.description
      );

      const resize = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        if (entries.length) {
          const content = entries[0].contentRect;
          if (content.height) {
            if (40 < content.height) {
              this.canDescriptionFolded = true;
            } else {
              this.canDescriptionFolded = false;
            }
            resize.disconnect();
            this.cdr.detectChanges();
          }
        }
      });
      resize.observe(this.originElement);
    }
  }

  onCardClick(): void {
    if (this.checkStatus === 'todo' && this.type === 'today') {
      const {
        dailyWorkId,
        measureName,
        beginTime,
        endTime,
        description,
        relatedFunc,
      } = this.dailyWorkData;
      const param = {
        dailyWorkId,
        measureName,
        beginTime,
        endTime,
        description,
        relatedFunc,
      };
      sessionStorage.setItem('feedbackParam', JSON.stringify(param));
      this.router
        .navigate(['/energyManager/feedback'], { queryParams: { dailyWorkId } })
        .then((e) => {
          if (e) {
            console.log('Navigation is successful!');
          } else {
            console.log('Navigation has failed!');
          }
        });
    }
  }

  toggleDescription(event: MouseEvent, toggle: boolean): void {
    if (event.stopPropagation) {
      event.stopPropagation();
      this.isDescriptionFolded = toggle;
      if (toggle) {
        this.clampElement.style.setProperty('--text-line', '2');
        document
          .querySelector('ion-content')
          .scrollToPoint(0, this.el.nativeElement.offsetTop - 20);
      } else {
        const line: number =
          Math.ceil(this.descriptionElement.clientHeight / 20) + 1;
        this.clampElement.style.setProperty('--text-line', line.toString());
        document
          .querySelector('ion-content')
          .scrollToPoint(0, this.el.nativeElement.offsetTop - 20);
      }
    }
  }

  toggleDetail(): void {
    this.showDetail = !this.showDetail;
  }

  getImgSrc(attachSrc: string): string {
    const tenantCode: string = sessionStorage.getItem('tenantId') || '';
    const prefixUrl = '/energy-ems/file/downloadSingleFile/';
    return `${prefixUrl}${attachSrc}?tenantCode=${tenantCode}`;
  }

  isAfterStartTime(
    serverTimeHours: number,
    serverTimeMinutes: number,
    startTime: string
  ): boolean {
    if (!startTime) {
      return false;
    }

    const [startHours, startMinutes] = startTime.split(':');
    if (!startHours || !startMinutes) {
      return false;
    }

    return (
      serverTimeHours * 60 + serverTimeMinutes >=
      +startHours * 60 + +startMinutes
    );
  }

  isBeforeEndTime(
    serverTimeHours: number,
    serverTimeMinutes: number,
    endTime: string
  ): boolean {
    if (!endTime) {
      return false;
    }

    const [endHours, endMinutes] = endTime.split(':');
    if (!endHours || !endMinutes) {
      return false;
    }

    return (
      serverTimeHours * 60 + serverTimeMinutes <= +endHours * 60 + +endMinutes
    );
  }
  bigImage(item: string): void {
    this.imageClick.emit(item);
  }
}
