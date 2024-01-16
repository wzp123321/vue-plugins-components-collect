import { TestBed } from '@angular/core/testing';

import { WorkPlanDatabaseService } from './work-plan-database.service';

describe('WorkPlanDatabaseService', () => {
  let service: WorkPlanDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPlanDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
