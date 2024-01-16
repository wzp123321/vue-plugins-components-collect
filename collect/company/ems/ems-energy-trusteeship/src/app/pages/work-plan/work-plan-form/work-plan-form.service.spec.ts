import { TestBed } from '@angular/core/testing';

import { WorkPlanFormService } from './work-plan-form.service';

describe('WorkPlanFormService', () => {
  let service: WorkPlanFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPlanFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
