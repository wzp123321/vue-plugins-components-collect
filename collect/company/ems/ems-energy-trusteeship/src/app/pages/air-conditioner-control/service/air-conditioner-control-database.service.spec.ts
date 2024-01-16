import { TestBed } from '@angular/core/testing';

import { AirConditionerControlDatabaseService } from './air-conditioner-control-database.service';

describe('AirConditionerControlDatabaseService', () => {
  let service: AirConditionerControlDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
