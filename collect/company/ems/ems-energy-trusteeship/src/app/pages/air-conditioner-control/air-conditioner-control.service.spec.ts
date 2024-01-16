import { TestBed } from '@angular/core/testing';

import { AirConditionerControlService } from './air-conditioner-control.service';

describe('AirConditionerControlService', () => {
  let service: AirConditionerControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
