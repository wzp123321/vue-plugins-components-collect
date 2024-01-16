import { TestBed } from '@angular/core/testing';

import { EnergyEventCardsService } from './energy-event-cards.service';

describe('EnergyEventCardsService', () => {
  let service: EnergyEventCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyEventCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
