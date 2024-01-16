import { TestBed } from '@angular/core/testing';

import { AirConditionerControlStatisticsService } from './air-conditioner-control-statistics.service';

describe('AirConditionerControlStatisticsService', () => {
  let service: AirConditionerControlStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
