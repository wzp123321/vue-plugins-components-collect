import { TestBed } from '@angular/core/testing';

import { EnergyEventService } from './energy-event.service';

describe('EnergyEventService', () => {
  let service: EnergyEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
