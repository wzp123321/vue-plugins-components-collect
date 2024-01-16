import { TestBed } from '@angular/core/testing';

import { WorkPlanSearchService } from './work-plan-search.service';

describe('WorkPlanSearchService', () => {
  let service: WorkPlanSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPlanSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
