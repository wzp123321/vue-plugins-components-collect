import { TestBed } from '@angular/core/testing';

import { WorkPlanTableService } from './work-plan-table.service';

describe('WorkPlanTableService', () => {
  let service: WorkPlanTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPlanTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
