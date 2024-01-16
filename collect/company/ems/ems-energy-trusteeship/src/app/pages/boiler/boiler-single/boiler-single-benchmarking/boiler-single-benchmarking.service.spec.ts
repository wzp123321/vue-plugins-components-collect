import { TestBed } from '@angular/core/testing';

import { BoilerSingleBenchmarkingService } from './boiler-single-benchmarking.service';

describe('BoilerSingleBenchmarkingService', () => {
  let service: BoilerSingleBenchmarkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerSingleBenchmarkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
