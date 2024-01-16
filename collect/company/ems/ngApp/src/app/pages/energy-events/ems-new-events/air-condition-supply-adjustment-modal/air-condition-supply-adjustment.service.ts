import { Injectable } from '@angular/core';
import { EEnergyEvent, EEntryMode, IAirConditionSupplyAdjustmentEvent } from '../../energy-events.api';
import { EnergyEventModalService } from '../ems-events-modal/energy-event-modal.service';
import { NewEnergyEventService } from '../new-energy-event.service';

const NULL_DATA: IAirConditionSupplyAdjustmentEvent = {
  id: 0,
  eventTypeId: EEnergyEvent.AirConditionSupplyAdjustmentEvent,
  entryPersonnel: sessionStorage.getItem('userName') || 'not find',
  eventTitle: null,
  startTime: null,
  endTime: null,
  adjustmentType: null,
  entryMode: null,
  energyObjects: null,
  relationData: [],
  filePaths: [],
  eventDetail: null,
};

type K = keyof IAirConditionSupplyAdjustmentEvent;
type V = IAirConditionSupplyAdjustmentEvent[K];

@Injectable()
export class AirConditionSupplyAdjustmentService extends NewEnergyEventService<IAirConditionSupplyAdjustmentEvent> {
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
    if (!this.data.adjustmentType) {
      this.validator = 'adjustmentType';
      return;
    }
    if (!this.data.startTime) {
      this.validator = 'startTime';
      return;
    }
    if (!this.data.endTime) {
      this.validator = 'endTime';
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
