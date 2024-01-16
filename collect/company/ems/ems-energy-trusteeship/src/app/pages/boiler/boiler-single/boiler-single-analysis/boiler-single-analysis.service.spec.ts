import { TestBed } from '@angular/core/testing';

import { BoilerSingleAnalysisService } from './boiler-single-analysis.service';

describe('BoilerSingleAnalysisService', () => {
  let service: BoilerSingleAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerSingleAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
