import { TestBed } from '@angular/core/testing';

import { AirConditionerControlOverviewService } from './air-conditioner-control-overview.service';

describe('AirConditionerControlOverviewService', () => {
  let service: AirConditionerControlOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
