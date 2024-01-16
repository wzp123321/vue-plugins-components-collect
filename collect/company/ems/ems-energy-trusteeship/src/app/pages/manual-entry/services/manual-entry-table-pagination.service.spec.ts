import { TestBed } from '@angular/core/testing';

import { ManualEntryTablePaginationService } from './manual-entry-table-pagination.service';

describe('ManualEntryTablePaginationService', () => {
  let service: ManualEntryTablePaginationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryTablePaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
