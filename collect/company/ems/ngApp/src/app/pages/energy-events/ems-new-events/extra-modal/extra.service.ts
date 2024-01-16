import { Injectable } from '@angular/core';
import { EEnergyEvent, IExtraEvent } from '../../energy-events.api';
import { EnergyEventModalService } from '../ems-events-modal/energy-event-modal.service';
import { NewEnergyEventService } from '../new-energy-event.service';

const NULL_DATA: IExtraEvent = {
  id: 0,
  eventTypeId: EEnergyEvent.ExtraEvent,
  entryPersonnel: sessionStorage.getItem('userName') || 'not find',
  eventTitle: null,
  startTime: null,
  endTime: null,
  relationData: [],
  filePaths: [],
  eventDetail: null,
};

type K = keyof IExtraEvent;
type V = IExtraEvent[K];

@Injectable()
export class ExtraService extends NewEnergyEventService<IExtraEvent> {
  constructor(protected sEnergyEventModal: EnergyEventModalService) {
    super(sEnergyEventModal);
    for (const [k, v] of Object.entries(NULL_DATA)) {
      (this.data[k as K] as V) = v;
    }
  }

  protected checkData(): void {
    if (!this.data.eventTitle) {
      this.validator = 'eventTitle';
      return;
    }
    if (!this.data.startTime) {
      this.validator = 'startTime';
      return;
    }
    if (this.data.relationData && this.data.relationData.length) {
      const detector = this.data.relationData.every((v, i) => {
        if (!v.energyCode) {
          this.validator = `relationData-${i}`;
          return false;
        }
        if (!v.codeValue) {
          this.validator = `relationData-${i}`;
          return false;
        }
        return true;
      });
      if (!detector) {
        return;
      }
    } else {
      this.validator = 'relationData';
      return;
    }
    this.validator = null;
  }
}
