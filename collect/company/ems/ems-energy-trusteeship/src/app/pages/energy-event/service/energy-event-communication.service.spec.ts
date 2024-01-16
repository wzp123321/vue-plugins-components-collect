import { TestBed } from '@angular/core/testing';

import { EnergyEventCommunicationService } from './energy-event-communication.service';

describe('EnergyEventCommunicationService', () => {
  let service: EnergyEventCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
