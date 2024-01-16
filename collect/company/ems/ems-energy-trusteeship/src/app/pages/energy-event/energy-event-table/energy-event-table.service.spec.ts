import { TestBed } from '@angular/core/testing';

import { EnergyEventTableService } from './energy-event-table.service';

describe('EnergyEventTableService', () => {
  let service: EnergyEventTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
