import { TestBed } from '@angular/core/testing';

import { FreezerSingleAnalysisService } from './freezer-single-analysis.service';

describe('FreezerSingleAnalysisService', () => {
  let service: FreezerSingleAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerSingleAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
