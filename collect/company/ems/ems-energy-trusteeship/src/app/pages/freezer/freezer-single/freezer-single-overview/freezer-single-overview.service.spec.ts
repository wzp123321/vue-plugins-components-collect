import { TestBed } from '@angular/core/testing';

import { FreezerSingleOverviewService } from './freezer-single-overview.service';

describe('FreezerSingleOverviewService', () => {
  let service: FreezerSingleOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerSingleOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
