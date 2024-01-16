import { TestBed } from '@angular/core/testing';

import { EnergyEventChartService } from './energy-event-chart.service';

describe('EnergyEventChartService', () => {
  let service: EnergyEventChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
