import { Injectable } from '@angular/core';
import { EEnergyEvent, IEnergyConsumptionAreaChangeEvent } from '../../energy-events.api';
import { EnergyEventModalService } from '../ems-events-modal/energy-event-modal.service';
import { NewEnergyEventService } from '../new-energy-event.service';

const NULL_DATA: IEnergyConsumptionAreaChangeEvent = {
  id: 0,
  eventTypeId: EEnergyEvent.EnergyConsumptionAreaChangeEvent,
  // entryPersonnel: sessionStorage.getItem('userName') || 'not find',
  eventTitle: null,
  startTime: null,
  energyObjects: null,
  filePaths: [],
  eventDetail: null,
};

type K = keyof IEnergyConsumptionAreaChangeEvent;
type V = IEnergyConsumptionAreaChangeEvent[K];

@Injectable()
export class EnergyConsumptionAreaService extends NewEnergyEventService<IEnergyConsumptionAreaChangeEvent> {
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
    if (!this.data.energyObjects) {
      this.validator = 'areaId';
      return;
    }
    this.validator = null;
  }
}
