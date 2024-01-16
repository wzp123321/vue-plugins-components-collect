import { TestBed } from '@angular/core/testing';

import { WorkRecordCommunicationService } from './work-record-communication.service';

describe('WorkRecordCommunicationService', () => {
  let service: WorkRecordCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkRecordCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
