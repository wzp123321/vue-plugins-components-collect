import { TestBed } from '@angular/core/testing';

import { AirConditionerControlCardsService } from './air-conditioner-control-cards.service';

describe('AirConditionerControlCardsService', () => {
  let service: AirConditionerControlCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirConditionerControlCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
