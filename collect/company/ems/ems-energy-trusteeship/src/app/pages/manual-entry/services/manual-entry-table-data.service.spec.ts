import { TestBed } from '@angular/core/testing';

import { ManualEntryTableDataService } from './manual-entry-table-data.service';

describe('ManualEntryTableDataService', () => {
  let service: ManualEntryTableDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryTableDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
