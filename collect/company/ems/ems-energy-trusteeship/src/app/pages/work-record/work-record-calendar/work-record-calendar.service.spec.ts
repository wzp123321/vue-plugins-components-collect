import { TestBed } from '@angular/core/testing';

import { WorkRecordCalendarService } from './work-record-calendar.service';

describe('WorkRecordCalendarService', () => {
  let service: WorkRecordCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkRecordCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
