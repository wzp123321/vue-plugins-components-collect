import { TestBed } from '@angular/core/testing';

import { AirConditionerControlCommunicationService } from './air-conditioner-control-communication.service';

describe('AirConditionerControlCommunicationService', () => {
  let service: AirConditionerControlCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
