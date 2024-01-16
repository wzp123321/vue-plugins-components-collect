import { TestBed } from '@angular/core/testing';

import { EnergyManagerService } from './energy-manager.service';

describe('EnergyManagerService', () => {
  let service: EnergyManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
