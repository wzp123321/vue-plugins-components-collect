import { TestBed } from '@angular/core/testing';

import { AirConditionerControlCardsChartService } from './air-conditioner-control-cards-chart.service';

describe('AirConditionerControlCardsChartService', () => {
  let service: AirConditionerControlCardsChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlCardsChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
