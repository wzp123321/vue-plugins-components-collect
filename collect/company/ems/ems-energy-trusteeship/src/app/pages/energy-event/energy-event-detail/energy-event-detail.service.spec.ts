import { TestBed } from '@angular/core/testing';

import { EnergyEventDetailService } from './energy-event-detail.service';

describe('EnergyEventDetailService', () => {
  let service: EnergyEventDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
