import { TestBed } from '@angular/core/testing';

import { EnergyEventsService } from './energy-events.service';

describe('EnergyEventsService', () => {
  let service: EnergyEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
