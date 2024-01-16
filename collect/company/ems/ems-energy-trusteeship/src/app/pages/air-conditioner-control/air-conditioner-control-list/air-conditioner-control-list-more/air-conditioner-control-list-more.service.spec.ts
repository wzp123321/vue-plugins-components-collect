import { TestBed } from '@angular/core/testing';

import { AirConditionerControlListMoreService } from './air-conditioner-control-list-more.service';

describe('AirConditionerControlListMoreService', () => {
  let service: AirConditionerControlListMoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlListMoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
