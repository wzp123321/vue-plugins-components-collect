import { TestBed } from '@angular/core/testing';

import { AirConditionerControlPredictService } from './air-conditioner-control-predict.service';

describe('AirConditionerControlPredictService', () => {
  let service: AirConditionerControlPredictService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlPredictService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
