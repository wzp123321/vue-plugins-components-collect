import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, ElementRef, OnInit, Self, ViewChild } from '@angular/core';
import {
  EE_EEventType,
  EE_EEventType_Options,
  EE_ICardItem,
} from '../energy-event.api';
import { EnergyEventCardsService } from './energy-event-cards.service';

const ANIMATE_OPTIONS = {
  COUNT: 8,
  OFFSET: 236,
  TIME: '666ms ease-out',
};
@Component({
  selector: 'ems-energy-event-cards',
  templateUrl: './energy-event-cards.component.html',
  styleUrls: ['./energy-event-cards.component.less'],
  providers: [EnergyEventCardsService],
  animations: [
    trigger('swipe', [
      ...Array.from({ length: ANIMATE_OPTIONS.COUNT }, (v, k) =>
        state(
          `${k}`,
          style({ transform: `translateX(-${k * ANIMATE_OPTIONS.OFFSET}px)` })
        )
      ),
      transition(':increment', [animate(ANIMATE_OPTIONS.TIME)]),
      transition(':decrement', [animate(ANIMATE_OPTIONS.TIME)]),
    ]),
  ],
})
export class EnergyEventCardsComponent implements OnInit {
  @ViewChild('elementCardList', { static: true })
  private refCardList: ElementRef<HTMLDivElement>;

  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get unit(): string {
    return this.service.unit;
  }

  public get current(): EE_EEventType {
    return this.service.current;
  }

  public get typeOptions(): {
    label: string;
    value: EE_EEventType;
    color: string;
  }[] {
    return EE_EEventType_Options;
  }

  public get canSwipeLeft(): boolean {
    return this.index > 0;
  }
  public get canSwipeRight(): boolean {
    if (this.index < ANIMATE_OPTIONS.COUNT - 1) {
      const scrollWidth = this.refCardList.nativeElement.scrollWidth;
      const clientWidth = this.refCardList.nativeElement.clientWidth;

      if (scrollWidth && clientWidth) {
        return scrollWidth - clientWidth > this.index * ANIMATE_OPTIONS.OFFSET;
      }
      return true;
    } else {
      return false;
    }
  }

  public index = 0;

  constructor(@Self() private service: EnergyEventCardsService) {}

  ngOnInit(): void {
    const params = window.sessionStorage.getItem('ems-anomaly-event-params');
    const parseParams = params ? JSON.parse(params) : {};
    if (parseParams?.eventType) {
      this.service.current = Number(parseParams?.eventType);

      this.index = this.typeOptions.findIndex((item) => {
        return item.value === this.service.current;
      });
      window.sessionStorage.removeItem('ems-anomaly-event-params');
    }
  }

  public selectCard(type?: EE_EEventType): void {
    if (this.isLoading) {
      return;
    }

    this.service.current = type ?? 0;
  }

  public swipeToLeft(): void {
    if (this.canSwipeLeft) {
      this.index--;
    }
  }

  public swipeToRight(): void {
    if (this.canSwipeRight) {
      this.index++;
    }
  }

  public getCard(key: EE_EEventType = 0): EE_ICardItem {
    return this.service.getCard(key);
  }

  public mapCardIcon(type: EE_EEventType = 0): string {
    const prefix = 'assets/icon/energy-event/eec-card-';
    switch (type) {
      case EE_EEventType.能源单价调整:
        return `${prefix}price.svg`;
      case EE_EEventType.用能区域变化:
        return `${prefix}area.svg`;
      case EE_EEventType.大功率用能设备变更:
        return `${prefix}equipment.svg`;
      case EE_EEventType.综合业务量变化:
        return `${prefix}hospital.svg`;
      case EE_EEventType.区域业务调整:
        return `${prefix}business.svg`;
      case EE_EEventType.空调供应时段调整:
        return `${prefix}conditioner.svg`;
      case EE_EEventType.其他调整:
        return `${prefix}other.svg`;
      default:
        return `${prefix}annual.svg`;
    }
  }
}
