import { TestBed } from '@angular/core/testing';

import { FreezerSingleBenchmarkingService } from './freezer-single-benchmarking.service';

describe('FreezerSingleBenchmarkingService', () => {
  let service: FreezerSingleBenchmarkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerSingleBenchmarkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
