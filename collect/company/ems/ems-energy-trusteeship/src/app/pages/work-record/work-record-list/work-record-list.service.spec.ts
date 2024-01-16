import { TestBed } from '@angular/core/testing';

import { WorkRecordListService } from './work-record-list.service';

describe('WorkRecordListService', () => {
  let service: WorkRecordListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkRecordListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
