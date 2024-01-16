import { TestBed } from '@angular/core/testing';

import { EnergyEventDatabaseService } from './energy-event-database.service';

describe('EnergyEventDatabaseService', () => {
  let service: EnergyEventDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
