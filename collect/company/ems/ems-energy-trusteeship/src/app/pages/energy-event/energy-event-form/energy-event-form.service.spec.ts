import { TestBed } from '@angular/core/testing';

import { EnergyEventFormService } from './energy-event-form.service';

describe('EnergyEventFormService', () => {
  let service: EnergyEventFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
