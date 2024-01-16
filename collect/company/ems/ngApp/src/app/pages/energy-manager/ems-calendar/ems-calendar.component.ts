import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CCalendarWork, CTodayWork, ICalendarMonth } from './ems-calendar.api';
import { EmsCalendarService } from './ems-calendar.service';

@Component({
  selector: 'app-ems-calendar',
  templateUrl: './ems-calendar.component.html',
  styleUrls: ['./ems-calendar.component.scss'],
  providers: [EmsCalendarService],
})
export class EmsCalendarComponent implements OnInit, OnDestroy {
  @Input('start-of-week') startOfWeek: number = 1;

  private _type: 'today' | 'calendar' = 'today';
  get type(): 'today' | 'calendar' {
    return this._type;
  }
  @Input() set type(v: 'today' | 'calendar') {
    if (v !== this._type) {
      this.isDefaultView = true;
      this._type = v;
      if (this._type === 'today') {
        this.chooseToday();
      } else {
        this.chooseDate(new Date());
      }
    }
  }

  @Input('collapse') set scrollDistance(v: number) {
    if (v) {
      if (this._type === 'today') {
        this.changeTodayToLite(0 < v);
        this.changeTodayToDefault(v < 0);
      } else {
        this.changeCalendarToWeek(0 < v);
        this.changeCalendarToMonth(-1 < v && v < 0);
      }
    }
  }

  @Output('on-choose-today')
  onChooseToday: EventEmitter<CTodayWork> = new EventEmitter<CTodayWork>();
  @Output('on-choose-date')
  onChooseDate: EventEmitter<CCalendarWork> = new EventEmitter<CCalendarWork>();
  @Output('on-toggle')
  onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  isDefaultView: boolean = true;
  calendarTitles: number[] = [...new Array(7).keys()];
  weeks: [Date[], Date[], Date[]] = [[], [], []];
  months: [ICalendarMonth, ICalendarMonth, ICalendarMonth] = [
    { year: null, month: null, data: [[]] },
    { year: null, month: null, data: [[]] },
    { year: null, month: null, data: [[]] },
  ];
  slideOption: { [key: string]: any } = {
    initialSlide: 1,
    centeredSlides: true,
    speed: 233,
  };

  constructor(public sEmsCalendar: EmsCalendarService, private activatedRouter: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRouter.url.subscribe(async () => {
      this.startOfWeek = +this.startOfWeek;
      if (this.calendarTitles.includes(this.startOfWeek)) {
        this.calendarTitles = [...this.calendarTitles.slice(this.startOfWeek), ...new Array(this.startOfWeek).keys()];
      }
      await this.chooseToday();
    });
  }

  ngOnDestroy(): void {
    this.weeks = [[], [], []];
    this.months = [
      { year: null, month: null, data: [[]] },
      { year: null, month: null, data: [[]] },
      { year: null, month: null, data: [[]] },
    ];
  }

  private setWeek(date: Date, flag: -1 | 0 | 1 = 0): void {
    const index = flag + 1;
    date = new Date(date.toLocaleDateString());
    if (this.weeks[index].length !== 7 || +date < +this.weeks[index][0] || +this.weeks[index][6] + 86400000 <= +date) {
      this.weeks[index] = [];
      const start = this.calendarTitles.indexOf(date.getDay());
      this.weeks[index] = [
        ...Array.from({ length: start }, (v, k: number) => {
          return new Date(+date - 86400000 * (start - k));
        }),
        ...Array.from({ length: 7 - start }, (v, k: number) => {
          return new Date(+date + 86400000 * k);
        }),
      ];
    }
  }

  private setMonth(year: number, month: number, flag: -1 | 0 | 1 = 0): void {
    if (0 === month) {
      year -= 1;
      month = 12;
    }
    if (13 === month) {
      year += 1;
      month = 1;
    }
    const index = flag + 1;
    if (
      this.months[index].data.length < 4 ||
      +year !== this.months[index].year ||
      +month !== this.months[index].month
    ) {
      this.months[index].year = year;
      this.months[index].month = month;
      this.months[index].data = [];
      const days = Array.from({ length: new Date(year, month, 0).getDate() }, (v, k: number) => {
        return new Date(`${year}/${month}/${k + 1}`);
      });
      const start = this.calendarTitles.indexOf(days[0].getDay());
      let week = Array.from({ length: start }, (v, k) => {
        return new Date(+days[0] - 86400000 * (start - k));
      });
      days.forEach((v) => {
        week.push(v);
        if (week.length === 7) {
          this.months[index].data.push(week);
          week = [];
        }
      });
      if (week.length) {
        const date: Date = days.pop();
        this.months[index].data.push(
          week.concat(
            Array.from({ length: 7 - week.length }, (v, k) => {
              return new Date(+date + 86400000 * (k + 1));
            })
          )
        );
      }
      while (this.months[index].data.length < 6) {
        const date: Date = this.months[index].data[this.months[index].data.length - 1][6];
        this.months[index].data.push(
          Array.from({ length: 7 }, (v, k) => {
            return new Date(+date + 86400000 * (k + 1));
          })
        );
      }
    }
  }

  preventDefault(event: TouchEvent): void {
    if (event.preventDefault) {
      event.preventDefault();
    }
  }

  changeTodayToLite(event: boolean): void {
    if (event) {
      this.onToggle.emit(this.isDefaultView);
      this.isDefaultView = false;
    }
  }

  changeTodayToDefault(event: boolean): void {
    if (event) {
      this.onToggle.emit(!this.isDefaultView);
      this.isDefaultView = true;
    }
  }

  changeCalendarToWeek(event: boolean): void {
    if (event) {
      this.onToggle.emit(!this.isDefaultView);
      this.isDefaultView = true;
    }
  }

  changeCalendarToMonth(event: boolean): void {
    if (event) {
      this.onToggle.emit(this.isDefaultView);
      this.isDefaultView = false;
    }
  }

  jumpToAlarm(): void {
    // window.location.href = `/apphtml/index.htm?itemCode=504&mode=1&status=0,1&source=ems-em`;
    window.location.href = `/apphtml/index.htm?itemCode=504&mode=1&status=1,2&source=ems-em`;
  }

  async chooseToday(): Promise<void> {
    if (await this.sEmsCalendar.setToday()) {
      this.onChooseToday.emit(this.sEmsCalendar.today);
    }
  }

  async chooseDate(date: Date): Promise<void> {
    this.setWeek(new Date(+date - 86400000 * 7), -1);
    this.setWeek(date, 0);
    this.setWeek(new Date(+date + 86400000 * 7), 1);
    this.setMonth(date.getFullYear(), date.getMonth(), -1);
    this.setMonth(date.getFullYear(), date.getMonth() + 1, 0);
    this.setMonth(date.getFullYear(), date.getMonth() + 2, 1);
    if (await this.sEmsCalendar.setDate(date)) {
      this.onChooseDate.emit(this.sEmsCalendar.day);
    }
  }

  async onSlideChange(event: Event): Promise<void> {
    const slides = event.target as HTMLIonSlidesElement;
    await slides.lockSwipes(true);
  }

  async toChangeWeek(event: Event): Promise<void> {
    const slides = event.target as HTMLIonSlidesElement;
    const index = await slides.getActiveIndex();
    let date: Date = null;
    switch (index) {
      case 0:
        if (7 === this.weeks[0].length) {
          date = this.weeks[0][0];
          this.weeks.unshift([]);
          this.weeks.pop();
          this.setWeek(new Date(+date - 86400000 * 7), -1);
        }
        break;
      case 2:
        if (7 === this.weeks[2].length) {
          date = this.weeks[2][0];
          this.weeks.push([]);
          this.weeks.shift();
          this.setWeek(new Date(+date + 86400000 * 7), 1);
        }
        break;
      default:
        break;
    }
    await slides.lockSwipes(false);
    slides.slideTo(1, 0);
    if (date) {
      await this.chooseDate(date);
    }
  }

  async toChangeMonth(event: Event): Promise<void> {
    const slides = event.target as HTMLIonSlidesElement;
    const index = await slides.getActiveIndex();
    let date: Date = null;
    switch (index) {
      case 0:
        if (3 < this.months[0].data.length) {
          date = new Date(`${this.months[0].year}/${this.months[0].month}/1`);
          this.months.unshift({ year: null, month: null, data: [[]] });
          this.months.pop();
          this.setMonth(date.getFullYear(), date.getMonth(), -1);
        }
        break;
      case 2:
        if (3 < this.months[2].data.length) {
          date = new Date(`${this.months[2].year}/${this.months[2].month}/1`);
          this.months.push({ year: null, month: null, data: [[]] });
          this.months.shift();
          this.setMonth(date.getFullYear(), date.getMonth() + 2, 1);
        }
        break;
      default:
        break;
    }
    await slides.lockSwipes(false);
    slides.slideTo(1, 0);
    if (date) {
      await this.chooseDate(date);
    }
  }
}
