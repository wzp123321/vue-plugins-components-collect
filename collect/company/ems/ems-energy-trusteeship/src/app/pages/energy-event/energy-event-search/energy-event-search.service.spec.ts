import { TestBed } from '@angular/core/testing';

import { EnergyEventSearchService } from './energy-event-search.service';

describe('EnergyEventSearchService', () => {
  let service: EnergyEventSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
