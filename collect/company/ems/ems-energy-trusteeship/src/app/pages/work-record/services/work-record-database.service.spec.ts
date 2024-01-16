import { TestBed } from '@angular/core/testing';

import { WorkRecordDatabaseService } from './work-record-database.service';

describe('WorkRecordDatabaseService', () => {
  let service: WorkRecordDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkRecordDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
