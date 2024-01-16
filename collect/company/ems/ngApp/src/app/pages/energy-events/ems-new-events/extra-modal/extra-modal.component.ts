import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, LOCALE_ID, OnDestroy, OnInit, Output, Self } from '@angular/core';
import { IExtraEvent } from '../../energy-events.api';
import { NewEnergyEventService } from '../new-energy-event.service';
import { ExtraService } from './extra.service';

@Component({
  selector: 'app-extra-modal',
  templateUrl: './extra-modal.component.html',
  styleUrls: ['./extra-modal.component.scss'],
  providers: [ExtraService],
  viewProviders: [{ provide: NewEnergyEventService, useExisting: ExtraService }],
})
export class ExtraModalComponent implements OnInit, OnDestroy {
  @Output('onToggleModal')
  public onToggleModal: EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }> = new EventEmitter<{
    canGoBack: boolean;
    canShowFooter: boolean;
  }>();

  public get canShowEmptyMarker(): boolean {
    return this.service.canShowEmptyMarker;
  }

  public get data(): IExtraEvent {
    return this.service.data;
  }

  public startTimeSelector: ICalendar = {
    date: this.data.startTime ? new Date(this.data.startTime) : null,
    min: this.data.endTime ? new Date(`${new Date(this.data.endTime).getFullYear()}/1/1`) : null,
    max: this.data.endTime ? new Date(this.data.endTime) : new Date(),
    show: false,
    onSelect: (date: Date) => {
      if (date) {
        this.data.startTime = formatDate(date, 'yyyy-MM-dd', this.locale);
        this.endTimeSelector.min = date;
        const newDate = new Date();
        const yearV = new Date(`${date.getFullYear()}/12/31`);
        //  console.group(yearV, date)
        if (yearV.getTime() > date.getTime()) {
          if (yearV.getTime() < newDate.getTime()) {
            this.endTimeSelector.max = yearV;
          } else {
            this.endTimeSelector.max = newDate;
          }
        } else {
          this.endTimeSelector.max = new Date(`${date.getFullYear()}/12/31`);
        }

        this.dismissStartTimeSelector();
      }
    },
  };
  public endTimeSelector: ICalendar = {
    date: this.data.endTime ? new Date(this.data.endTime) : null,
    min: this.data.startTime ? new Date(this.data.startTime) : null,
    max: this.data.startTime ? new Date(`${new Date(this.data.startTime).getFullYear()}/12/31`) : new Date(),
    show: false,
    onSelect: (date: Date) => {
      if (date) {
        this.data.endTime = formatDate(date, 'yyyy-MM-dd', this.locale);
        this.startTimeSelector.min = new Date(`${date.getFullYear()}/1/1`);
        this.startTimeSelector.max = date;
        this.dismissEndTimeSelector();
      }
    },
  };

  private imageSelector: HTMLIonActionSheetElement = null;
  saveClick: number = 0;
  constructor(@Self() private service: ExtraService, @Inject(LOCALE_ID) private locale: string) {
    this.service.toHandleInvalid.subscribe((v: HTMLIonContentElement) => {
      if (v) {
        this.service.canShowEmptyMarker = true;
        v.scrollToPoint(0, this.getJumpPoint(this.service.validator));
      }
    });
    this.service.toHandleGoBack.subscribe(() => {
      if (this.startTimeSelector.show) {
        this.dismissStartTimeSelector();
      }
      if (this.endTimeSelector.show) {
        this.dismissEndTimeSelector();
      }
      if (this.imageSelector) {
        this.imageSelector.dismiss();
      }
    });
    this.data.filePaths = [];
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.service.toHandleInvalid.unsubscribe();
    this.service.toHandleGoBack.unsubscribe();
  }

  public presentStartTimeSelector(): void {
    this.startTimeSelector.show = true;
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: false,
    });
  }
  public dismissStartTimeSelector(): void {
    this.startTimeSelector.show = false;
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public presentEndTimeSelector(): void {
    this.endTimeSelector.show = true;
    this.onToggleModal.emit({
      canGoBack: false,
      canShowFooter: false,
    });
  }
  public dismissEndTimeSelector(): void {
    this.endTimeSelector.show = false;
    this.onToggleModal.emit({
      canGoBack: true,
      canShowFooter: true,
    });
  }

  public onDetailChange(message: string): void {
    this.data.eventDetail = message;
  }

  public handleImageModalChange(modal: HTMLIonActionSheetElement): void {
    this.imageSelector = modal;
    if (this.imageSelector) {
      this.onToggleModal.emit({
        canGoBack: false,
        canShowFooter: true,
      });
    } else {
      this.onToggleModal.emit({
        canGoBack: true,
        canShowFooter: true,
      });
    }
  }

  private getJumpPoint(id: string): number {
    this.saveClick += 1;
    // console.log('dianji', this.saveClick)
    const element: HTMLElement = document.getElementById(id);
    return element.offsetTop ? element.offsetTop - 15 : null;
  }
}

interface ICalendar {
  date: Date;
  show: boolean;
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
}
