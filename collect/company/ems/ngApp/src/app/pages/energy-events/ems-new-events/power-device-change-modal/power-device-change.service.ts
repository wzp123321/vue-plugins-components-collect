import { Injectable } from '@angular/core';
import { EEnergyEvent, EEntryMode, IPowerDeviceChangeEvent } from '../../energy-events.api';
import { EnergyEventModalService } from '../ems-events-modal/energy-event-modal.service';
import { NewEnergyEventService } from '../new-energy-event.service';

const NULL_DATA: IPowerDeviceChangeEvent = {
  id: 0,
  eventTypeId: EEnergyEvent.PowerDeviceChangeEvent,
  // entryPersonnel: sessionStorage.getItem('userName') || 'not find',
  eventTitle: null,
  startTime: null,
  endTime: null,
  changeType: null,
  entryMode: null,
  energyObjects: null,
  relationData: [],
  //filePaths: [],
  eventDetail: null,
};

type K = keyof IPowerDeviceChangeEvent;
type V = IPowerDeviceChangeEvent[K];

@Injectable()
export class PowerDeviceChangeService extends NewEnergyEventService<IPowerDeviceChangeEvent> {
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
    if (!this.data.changeType) {
      this.validator = 'changeType';
      return;
    }
    switch (+this.data.entryMode) {
      case +EEntryMode.Binding: {
        if (!this.data.energyObjects) {
          this.validator = 'energyNode';
          return;
        }
        break;
      }
      case +EEntryMode.Manual: {
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
        break;
      }
      default: {
        this.validator = 'entryMode';
        return;
      }
    }
    this.validator = null;
  }
}
