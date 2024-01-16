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
import {
  EMCheckStatus,
  EMPeriodWorkType,
  EMWorkItem,
  EMWorkTimeType,
} from '../data-type';
import { Router } from '@angular/router';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';

@Component({
  selector: 'app-em-period-work-card',
  templateUrl: './em-period-work-card.component.html',
  styleUrls: ['./em-period-work-card.component.scss'],
})
export class EmPeriodWorkCardComponent implements OnInit, AfterViewInit {
  @Input() type: 'today' | 'calendar' = 'today';
  @Input() periodWorkData: EMWorkItem | null = null;
  @Input() periodWorkType: EMPeriodWorkType | null = null;
  @Input() timeType: EMWorkTimeType = 0;
  @Output() imageClick = new EventEmitter();
  showDetail = false;
  canDescriptionFolded: boolean = false;
  isDescriptionFolded: boolean = true;
  originElement: HTMLDivElement = null;
  clampElement: HTMLDivElement = null;
  descriptionElement: Element = null;

  public get deadlineTip(): string {
    if ('月' === this.periodWorkType) {
      if (this.periodWorkData?.deadline || +this.periodWorkData?.status === 3) {
        const date = new Date(this.periodWorkData?.deadline);
        return !!this.periodWorkData?.deadline
          ? `截止${date.getMonth() + 1}月${date.getDate()}日完成`
          : '';
      }
    }

    return null;
  }

  private readonly HISTORY_WORK_STATUS_MAP: { [key: number]: string } = {
    0: 'undone',
    1: 'done',
    2: 'delay',
  };

  private readonly TODAY_WORK_STATUS_MAP: { [key: number]: string } = {
    0: 'todo',
    1: 'done',
    2: 'delay',
    3: 'continue',
  };

  get checkStatus(): EMCheckStatus {
    if (this.periodWorkData === null) {
      return null;
    }
    //  this.periodWorkData.status = '0';
    if (this.timeType === 1) {
      return 'todo';
    }

    if (this.timeType === -1) {
      return this.HISTORY_WORK_STATUS_MAP[
        +this.periodWorkData.status
      ] as EMCheckStatus;
    }

    if (this.timeType === 0) {
      return this.TODAY_WORK_STATUS_MAP[
        +this.periodWorkData.status
      ] as EMCheckStatus;
    }

    return null;
  }

  constructor(
    private router: Router,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.periodWorkData.description) {
      this.originElement =
        this.el.nativeElement.getElementsByClassName('origin')[0];
      this.clampElement =
        this.el.nativeElement.getElementsByClassName('clamp')[0];
      this.descriptionElement =
        this.clampElement.getElementsByClassName('origin-text')[0];
      this.clampElement.setAttribute(
        'origin-text',
        this.periodWorkData.description
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
    if (
      (this.checkStatus === 'todo' || this.checkStatus === 'continue') &&
      this.type === 'today'
    ) {
      const {
        dailyWorkId,
        measureName,
        beginTime,
        endTime,
        description,
        relatedFunc,
      } = this.periodWorkData;
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
  bigImage(item: string): void {
    this.imageClick.emit(item);
  }
}
