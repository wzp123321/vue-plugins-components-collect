import { TestBed } from '@angular/core/testing';

import { BoilerMultipleAnalysisService } from './boiler-multiple-analysis.service';

describe('BoilerMultipleAnalysisService', () => {
  let service: BoilerMultipleAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerMultipleAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
