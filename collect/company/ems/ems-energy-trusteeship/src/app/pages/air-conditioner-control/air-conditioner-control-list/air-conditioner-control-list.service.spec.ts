import { TestBed } from '@angular/core/testing';

import { AirConditionerControlListService } from './air-conditioner-control-list.service';

describe('AirConditionerControlListService', () => {
  let service: AirConditionerControlListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
