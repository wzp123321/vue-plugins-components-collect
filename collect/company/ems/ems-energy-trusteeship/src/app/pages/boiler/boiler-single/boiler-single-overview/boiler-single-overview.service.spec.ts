import { TestBed } from '@angular/core/testing';

import { BoilerSingleOverviewService } from './boiler-single-overview.service';

describe('BoilerSingleOverviewService', () => {
  let service: BoilerSingleOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerSingleOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
