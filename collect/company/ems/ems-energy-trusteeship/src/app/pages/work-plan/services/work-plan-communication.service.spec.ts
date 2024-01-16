import { TestBed } from '@angular/core/testing';

import { WorkPlanCommunicationService } from './work-plan-communication.service';

describe('WorkPlanCommunicationService', () => {
  let service: WorkPlanCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPlanCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
