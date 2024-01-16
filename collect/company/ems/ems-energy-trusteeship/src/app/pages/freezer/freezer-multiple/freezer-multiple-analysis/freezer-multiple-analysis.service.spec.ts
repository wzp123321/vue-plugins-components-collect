import { TestBed } from '@angular/core/testing';

import { FreezerMultipleAnalysisService } from './freezer-multiple-analysis.service';

describe('FreezerMultipleAnalysisService', () => {
  let service: FreezerMultipleAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerMultipleAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
